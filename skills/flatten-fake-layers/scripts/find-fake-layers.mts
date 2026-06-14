/**
 * find-fake-layers — a deterministic detector for the "fake layer" slop that AI agents add:
 * functions/consts with EXACTLY ONE caller whose SHAPE is hand-rolled indirection rather than
 * a well-named helper. It complements whole-program dead-code tools (knip, fallow) which only
 * find ZERO-reference code; this finds the layer that has one caller and adds no fact.
 *
 * It emits EVIDENCE, never verdicts. Single-caller-ness is mechanically decidable; "does the
 * name add information the call site lacks?" is not. So the script narrows hundreds of
 * single-caller functions down to a short, ranked candidate list and a human/model makes the
 * keep-or-inline call per item. Bias is toward RECALL — a few false positives are fine; the
 * keep-list suppresses only signals that have no upstream to update.
 *
 * Three shapes are flagged (all AST-level, framework-agnostic):
 *   di-factory   factory whose param is captured inside the RETURNED closure = DI by closure
 *   alias        forwards its args unchanged to one project fn = "same call, different name"
 *   reshape      builds an object literal + forwards; ranked by how many CONSTANT fields it
 *                injects (few = clean inline-upstream target; many = assembling a real literal)
 *
 * Requires ts-morph + tsx (see scripts/package.json). Run:
 *   cd scripts && npm install
 *   node_modules/.bin/tsx find-fake-layers.mts <tsconfig> [pathFilter] [--json] [--all]
 *
 * Example: node_modules/.bin/tsx find-fake-layers.mts ../../apps/api/tsconfig.json src/server --json
 */
import { Node, Project, SyntaxKind, type ReferenceEntry } from "ts-morph";

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT TUNING — the only project/stack-flavored knobs. Defaults suit a Hono/Express
// monorepo with React + Zod. Adjust per repo; everything else is framework-agnostic.
// ─────────────────────────────────────────────────────────────────────────────
const TUNING = {
  // Names that signal a factory (DI smell when combined with a returned closure).
  factoryName: /^(create|make|provide|with)[A-Z]/,
  // Names that signal a value-carrying helper to KEEP (predicates read better than inlined conditions).
  predicateName: /^(is|has|should|can|will|are|was|did|does|allow|match)/,
  // React hook prefix — useCallback/useMemo closures are idiom, not DI. KEEP. Drop if non-React.
  hookName: /^use[A-Z]/,
  // Method names that register a handler with a router/framework — the lone "caller" is framework
  // registration, not real indirection. Tune for your router (Hono/Express defaults below).
  routeRegistrars: new Set([
    "get", "post", "put", "delete", "patch", "all", "use", "on", "onError", "route", "mount", "notFound", "options",
  ]),
  // How to derive a "package" from a path, for the cross-package-boundary suppression (a one-caller
  // export used by another package is public API, not a fake layer). Returns "<root>" if no match.
  packageOf: (filePath: string): string => filePath.match(/(?:apps|packages)\/([^/]+)/)?.[1] ?? "<root>",
  // Files to skip entirely (generated, declarations, entrypoints, framework config).
  excludeFile: (f: string): boolean =>
    f.includes("/node_modules/") ||
    f.includes("/dist/") ||
    f.includes("/.wxt/") ||
    /\.(test|spec)\.[tj]sx?$/.test(f) ||
    /\.gen\.ts$/.test(f) ||
    /\.d\.ts$/.test(f) ||
    /\.config\.[tj]s$/.test(f) ||
    /\/(main|index)\.[tj]sx?$/.test(f),
  // Validation/lifecycle bodies to KEEP regardless of shape (they own a real job).
  keepBodyText: /\.safeParse\(|Schema\.parse\(/, // Zod boundary parse; harmless if absent
};
// ─────────────────────────────────────────────────────────────────────────────

const [tsConfigArg, ...rest] = process.argv.slice(2);
if (!tsConfigArg) {
  console.error("usage: find-fake-layers.mts <tsconfig> [pathFilter] [--json] [--all]");
  process.exit(1);
}
const asJson = rest.includes("--json");
const showAll = rest.includes("--all");
const pathFilter = rest.find((a) => !a.startsWith("--"));

const project = new Project({ tsConfigFilePath: tsConfigArg });

function isUseSite(ref: ReferenceEntry): boolean {
  if (ref.isDefinition()) return false;
  const node = ref.getNode();
  if (node.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)) return false;
  if (node.getFirstAncestorByKind(SyntaxKind.ExportDeclaration)) return false;
  if (node.getFirstAncestorByKind(SyntaxKind.ExportSpecifier)) return false;
  return true;
}

function callerIsRouteRegistration(node: Node): boolean {
  const call = node.getFirstAncestorByKind(SyntaxKind.CallExpression);
  if (!call) return false;
  const expr = call.getExpression();
  return Node.isPropertyAccessExpression(expr) && TUNING.routeRegistrars.has(expr.getName());
}

function core(node: Node | undefined): Node | undefined {
  let n = node;
  while (n && (Node.isAwaitExpression(n) || Node.isParenthesizedExpression(n))) n = n.getExpression();
  return n;
}

function isBareIdentifierCall(node: Node | undefined): boolean {
  const c = core(node);
  if (!c) return false;
  if (Node.isConditionalExpression(c)) {
    return isBareIdentifierCall(c.getWhenTrue()) && isBareIdentifierCall(c.getWhenFalse());
  }
  return Node.isCallExpression(c) && Node.isIdentifier(c.getExpression());
}

function isObjectWithMethods(node: Node | undefined): boolean {
  const c = core(node);
  if (!c || !Node.isObjectLiteralExpression(c)) return false;
  return c.getProperties().some((p) => {
    if (Node.isMethodDeclaration(p)) return true;
    if (Node.isPropertyAssignment(p)) {
      const init = p.getInitializer();
      return !!init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init));
    }
    return false;
  });
}

type Shape = { node: Node; nameNode: Node; name: string; kind: string };

function getBody(fn: Node): Node | undefined {
  if (Node.isArrowFunction(fn) || Node.isFunctionDeclaration(fn) || Node.isFunctionExpression(fn)) {
    return fn.getBody();
  }
  return undefined;
}
function getParams(fn: Node): string[] {
  if (Node.isArrowFunction(fn) || Node.isFunctionDeclaration(fn) || Node.isFunctionExpression(fn)) {
    return fn.getParameters().map((p) => p.getName());
  }
  return [];
}

function classify(s: Shape): {
  slopKind: "di-factory" | "alias" | "reshape" | null;
  keep: string[];
  addedConstFields: number;
} {
  const fn = s.node;
  const body = getBody(fn);
  const params = getParams(fn);
  const keep: string[] = [];

  if (TUNING.predicateName.test(s.name)) keep.push("predicate-name");
  if (TUNING.hookName.test(s.name)) keep.push("react-hook");
  if (fn.getFirstDescendantByKind?.(SyntaxKind.TryStatement)) keep.push("try/finally");
  if (TUNING.keepBodyText.test(fn.getText())) keep.push("validation-boundary");

  if (!body) return { slopKind: null, keep, addedConstFields: 0 };

  const returns: (Node | undefined)[] = Node.isBlock(body)
    ? body.getDescendantsOfKind(SyntaxKind.ReturnStatement).map((r) => r.getExpression())
    : [body];

  // di-factory: a param captured inside a closure that IS the return value (handler/middleware/builder).
  const nestedClosures = [
    ...fn.getDescendantsOfKind(SyntaxKind.ArrowFunction),
    ...fn.getDescendantsOfKind(SyntaxKind.FunctionExpression),
  ].filter((c) => c !== fn);
  const paramCapturedInClosure =
    params.length > 0 &&
    nestedClosures.some((c) =>
      c.getDescendantsOfKind(SyntaxKind.Identifier).some((id) => params.includes(id.getText())),
    );
  const returnsProduct = returns.some((r) => {
    const c = core(r);
    if (!c) return false;
    if (Node.isArrowFunction(c) || Node.isFunctionExpression(c)) return true;
    if (isObjectWithMethods(c)) return true;
    if (Node.isCallExpression(c) && Node.isIdentifier(c.getExpression())) {
      return c.getArguments().some((a) => Node.isArrowFunction(a) || Node.isFunctionExpression(a));
    }
    if (Node.isIdentifier(c) && Node.isBlock(body)) {
      const decl = body
        .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
        .find((d) => d.getName() === c.getText());
      return !!decl && Node.isNewExpression(core(decl.getInitializer()) ?? decl);
    }
    return false;
  });
  const isFactory = params.length >= 1 && paramCapturedInClosure && returnsProduct;

  // reshape: only object-literal-const reshaping + delegated bare-identifier return.
  let isReshapeFwd = false;
  if (params.length >= 1 && !TUNING.predicateName.test(s.name) && returns.length > 0) {
    if (Node.isBlock(body)) {
      const nonReturn = body.getStatements().filter((st) => !Node.isReturnStatement(st));
      const allReshapeConsts = nonReturn.every(
        (st) =>
          Node.isVariableStatement(st) &&
          st.getDeclarations().every((d) => {
            const init = core(d.getInitializer());
            return !!init && Node.isObjectLiteralExpression(init);
          }),
      );
      isReshapeFwd = allReshapeConsts && returns.every(isBareIdentifierCall);
    } else {
      isReshapeFwd = isBareIdentifierCall(body);
    }
  }

  // alias: forwards args unchanged (no object construction) — highest-confidence reshape.
  let isAlias = false;
  if (isReshapeFwd) {
    const argsAllIdentifiers = (n: Node | undefined): boolean => {
      const c = core(n);
      if (!c) return false;
      if (Node.isConditionalExpression(c)) {
        return argsAllIdentifiers(c.getWhenTrue()) && argsAllIdentifiers(c.getWhenFalse());
      }
      return Node.isCallExpression(c) && c.getArguments().every((a) => Node.isIdentifier(a));
    };
    const noReshapeStmts =
      !Node.isBlock(body) ||
      body.getStatements().filter((st) => !Node.isReturnStatement(st)).length === 0;
    isAlias = noReshapeStmts && returns.every(argsAllIdentifiers);
  }

  // Count constant fields injected into forwarded object args (the "adds a const then forwards" smell).
  let addedConstFields = 0;
  if (isReshapeFwd || isFactory) {
    const objLiterals = fn
      .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
      .filter((o) => o.getFirstAncestorByKind(SyntaxKind.CallExpression));
    for (const obj of objLiterals) {
      for (const p of obj.getProperties()) {
        if (Node.isPropertyAssignment(p)) {
          const init = p.getInitializer();
          const refsParam =
            !!init &&
            init.getDescendantsOfKind(SyntaxKind.Identifier).some((id) => params.includes(id.getText()));
          if (!refsParam) addedConstFields++;
        } else if (Node.isShorthandPropertyAssignment(p)) {
          if (!params.includes(p.getName())) addedConstFields++;
        }
      }
    }
  }

  const slopKind = isFactory ? "di-factory" : isAlias ? "alias" : isReshapeFwd ? "reshape" : null;
  return { slopKind, keep, addedConstFields };
}

type Candidate = {
  name: string;
  file: string;
  line: number;
  callerCount: number;
  caller: string | null;
  slopKind: string | null;
  keep: string[];
  addedConstFields: number;
  crossesPackageBoundary: boolean;
  callerIsRouteRegistration: boolean;
};

const candidates: Candidate[] = [];

for (const sf of project.getSourceFiles()) {
  const filePath = sf.getFilePath();
  if (TUNING.excludeFile(filePath)) continue;
  if (pathFilter && !filePath.includes(pathFilter)) continue;

  const shapes: Shape[] = [];
  for (const fn of sf.getFunctions()) {
    const nameNode = fn.getNameNode();
    if (nameNode) shapes.push({ node: fn, nameNode, name: fn.getName() ?? "", kind: "function" });
  }
  for (const v of sf.getVariableDeclarations()) {
    const init = v.getInitializer();
    if (init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init))) {
      shapes.push({ node: init, nameNode: v.getNameNode(), name: v.getName(), kind: "const-fn" });
    }
  }

  for (const s of shapes) {
    if (!s.name || s.name === "default") continue;
    const refSymbols = (s.nameNode as { findReferences?: () => ReturnType<Node["findReferences"]> }).findReferences?.() ?? [];
    const useSites: ReferenceEntry[] = [];
    for (const rs of refSymbols) for (const ref of rs.getReferences()) if (isUseSite(ref)) useSites.push(ref);
    if (useSites.length > 1) continue;

    const callerNode = useSites[0]?.getNode();
    const { slopKind, keep, addedConstFields } = classify(s);
    const rel = (n: Node) =>
      `${n.getSourceFile().getFilePath().replace(process.cwd() + "/", "")}:${n.getStartLineNumber()}`;
    candidates.push({
      name: s.name,
      file: filePath.replace(process.cwd() + "/", ""),
      line: s.nameNode.getStartLineNumber(),
      callerCount: useSites.length,
      caller: callerNode ? rel(callerNode) : null,
      slopKind,
      keep,
      addedConstFields,
      crossesPackageBoundary: callerNode
        ? TUNING.packageOf(callerNode.getSourceFile().getFilePath()) !== TUNING.packageOf(filePath)
        : false,
      callerIsRouteRegistration: callerNode ? callerIsRouteRegistration(callerNode) : false,
    });
  }
}

function isCandidate(c: Candidate): boolean {
  return (
    c.callerCount === 1 &&
    c.slopKind !== null &&
    c.keep.length === 0 &&
    !c.crossesPackageBoundary &&
    !c.callerIsRouteRegistration
  );
}

// di-factory + alias first (mechanically certain), then reshape by FEWEST injected const fields
// (the cleanest inline-upstream targets lead).
function rank(c: Candidate): number {
  const kindWeight = c.slopKind === "di-factory" ? 0 : c.slopKind === "alias" ? 1 : 2;
  return kindWeight * 1000 + c.addedConstFields;
}

const flagged = candidates.filter(isCandidate).sort((a, b) => rank(a) - rank(b));
const dead = candidates.filter((c) => c.callerCount === 0);

if (asJson) {
  console.log(JSON.stringify(showAll ? candidates : flagged, null, 2));
} else {
  const single = candidates.filter((c) => c.callerCount === 1);
  console.log(`\nfind-fake-layers — ${pathFilter ?? "all"}\n`);
  console.log(
    `${single.length} single-caller total · ${flagged.length} refactor candidates · ${dead.length} zero-caller (dead-code tools own those)\n`,
  );
  console.log("── REFACTOR CANDIDATES: one caller, hand-rolled indirection (flatten / inline upstream) ──\n");
  for (const c of flagged) {
    const consts =
      c.addedConstFields > 0 ? `  +${c.addedConstFields} const field${c.addedConstFields > 1 ? "s" : ""}` : "";
    console.log(`  [${c.slopKind}]${consts}  ${c.name}  (${c.file}:${c.line})  → caller ${c.caller}`);
  }
  if (showAll) {
    console.log("\n── suppressed: predicates / hooks / lifecycle / named computations ──\n");
    for (const c of single.filter((c) => !isCandidate(c))) {
      console.log(`  ${c.name}  (${c.file}:${c.line})  ${c.slopKind ?? "helper"} ${c.keep.join(",")}`);
    }
  }
}
