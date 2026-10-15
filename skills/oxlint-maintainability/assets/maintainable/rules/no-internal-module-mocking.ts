// Framework binding matching adapts anti-slop/src/rules/no-module-mocking.ts (MIT).
import { defineRule } from "@oxlint/plugins";

import type { Definition, ESTree, SourceCode, Variable } from "@oxlint/plugins";

const defaultInternalPrefixes = ["@/", "~/", "#", "@repo/"];
// https://vitest.dev/api/vi.html#vi-mock and https://jestjs.io/docs/jest-object
const mockMethods = new Set(["mock", "doMock", "setMock", "unstable_mockModule"]);
const jestChainMethods = new Set([
  "enableAutomock", "disableAutomock", "unmock", "deepUnmock", "dontMock", "resetModules",
  "clearAllMocks", "resetAllMocks", "restoreAllMocks", "useFakeTimers", "useRealTimers", "setTimeout",
]);

function unwrap(expression: ESTree.Expression): ESTree.Expression {
  while (expression.type === "TSAsExpression" || expression.type === "TSSatisfiesExpression"
    || expression.type === "TSTypeAssertion" || expression.type === "TSNonNullExpression"
    || expression.type === "TSInstantiationExpression" || expression.type === "ParenthesizedExpression"
    || expression.type === "ChainExpression") {
    expression = expression.expression;
  }
  return expression;
}

function literalText(expression: ESTree.Expression): string | null {
  expression = unwrap(expression);
  if (expression.type === "Literal" && typeof expression.value === "string") return expression.value;
  if (expression.type === "TemplateLiteral" && expression.expressions.length === 0) {
    return expression.quasis[0]?.value.cooked ?? null;
  }
  return null;
}

function memberName(sourceCode: SourceCode, expression: ESTree.MemberExpression): string | null {
  if (!expression.computed) return expression.property.type === "Identifier" ? expression.property.name : null;
  return staticText(sourceCode, expression.property);
}

type Framework = "vitest" | "jest";
interface TestBinding {
  framework: Framework;
  kind: "namespace" | "api" | "mock" | "chain";
  method?: string;
  boundArgument?: ESTree.Argument;
}

function valueDefinition(definition: Definition): boolean {
  const node = definition.node;
  if (node.type === "TSTypeAliasDeclaration" || node.type === "TSInterfaceDeclaration" || node.type === "TSTypeParameter") return false;
  if (definition.parent?.type === "ImportDeclaration") {
    return definition.parent.importKind !== "type" && (node.type !== "ImportSpecifier" || node.importKind !== "type");
  }
  return node.type !== "TSImportEqualsDeclaration" || node.importKind !== "type";
}

function variableFor(sourceCode: SourceCode, identifier: ESTree.IdentifierReference): Variable | undefined {
  let scope = sourceCode.getScope(identifier);
  while (true) {
    const variable = scope.set.get(identifier.name);
    if (variable !== undefined && variable.defs.some(valueDefinition)) return variable;
    if (scope.upper === null) return undefined;
    scope = scope.upper;
  }
}

function unchangedGlobal(sourceCode: SourceCode, name: string): boolean {
  const scope = sourceCode.scopeManager.globalScope;
  return !scope?.through.some((reference) => reference.identifier.type === "Identifier"
    && reference.identifier.name === name && reference.isWrite())
    && !scope?.set.get(name)?.references.some((reference) => reference.isWrite());
}

function staticText(sourceCode: SourceCode, expression: ESTree.Expression, seen = new Set<Variable>()): string | null {
  expression = unwrap(expression);
  const literal = literalText(expression);
  if (literal !== null) return literal;
  if (expression.type === "BinaryExpression" && expression.operator === "+") {
    const left = staticText(sourceCode, expression.left, new Set(seen));
    const right = staticText(sourceCode, expression.right, new Set(seen));
    return left !== null && right !== null ? left + right : null;
  }
  if (expression.type === "TemplateLiteral") {
    let text = expression.quasis[0]?.value.cooked;
    if (text === null || text === undefined) return null;
    for (let index = 0; index < expression.expressions.length; index++) {
      const value = staticText(sourceCode, expression.expressions[index], new Set(seen));
      const tail = expression.quasis[index + 1]?.value.cooked;
      if (value === null || tail === null || tail === undefined) return null;
      text += value + tail;
    }
    return text;
  }
  if (expression.type !== "Identifier") return null;
  const variable = variableFor(sourceCode, expression);
  if (variable === undefined || seen.has(variable)
    || variable.references.some((reference) => reference.isWrite() && !reference.init)) return null;
  seen.add(variable);
  if (variable.defs.length !== 1) return null;
  const definition = variable.defs[0];
  return definition.node.type === "VariableDeclarator" && definition.node.id.type === "Identifier"
    && definition.node.init !== null ? staticText(sourceCode, definition.node.init, seen) : null;
}

function testMember(binding: TestBinding | null, name: string | null): TestBinding | null {
  // Vitest exports both names: https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/public/index.ts
  if (binding?.kind === "namespace"
    && (binding.framework === "vitest" ? name === "vi" || name === "vitest" : name === "jest")) {
    return { framework: binding.framework, kind: "api" };
  }
  if (binding?.kind === "api" && binding.framework === "jest" && name !== null && jestChainMethods.has(name)) {
    return { framework: "jest", kind: "chain" };
  }
  return binding?.kind === "api" && name !== null && mockMethods.has(name)
    && (binding.framework === "jest" || name === "mock" || name === "doMock")
    ? { framework: binding.framework, kind: "mock", method: name } : null;
}

function destructuredBinding(sourceCode: SourceCode, pattern: ESTree.BindingPattern, name: string, binding: TestBinding | null): TestBinding | null {
  if (pattern.type === "Identifier") return pattern.name === name ? binding : null;
  if (pattern.type === "AssignmentPattern") return destructuredBinding(sourceCode, pattern.left, name, binding);
  if (pattern.type !== "ObjectPattern") return null;
  for (const property of pattern.properties) {
    if (property.type !== "Property") continue;
    const key = !property.computed && property.key.type === "Identifier" ? property.key.name
      : property.key.type === "PrivateIdentifier" ? null : staticText(sourceCode, property.key);
    const result = destructuredBinding(sourceCode, property.value, name, testMember(binding, key));
    if (result !== null) return result;
  }
  return null;
}

function testBinding(sourceCode: SourceCode, expression: ESTree.Expression, seen = new Set<Variable>()): TestBinding | null {
  expression = unwrap(expression);
  if (expression.type === "MemberExpression") {
    return testMember(testBinding(sourceCode, expression.object, seen), memberName(sourceCode, expression));
  }
  if (expression.type === "CallExpression") {
    const callee = unwrap(expression.callee);
    if (callee.type === "MemberExpression" && memberName(sourceCode, callee) === "bind") {
      const binding = testBinding(sourceCode, callee.object, seen);
      return binding?.kind === "mock" && expression.arguments[0]?.type !== "SpreadElement"
        ? { ...binding, boundArgument: binding.boundArgument ?? expression.arguments[1] } : null;
    }
    if (callee.type === "Identifier" && callee.name === "require" && variableFor(sourceCode, callee) === undefined
      && unchangedGlobal(sourceCode, callee.name)) {
      const source = expression.arguments[0];
      if (source !== undefined && source.type !== "SpreadElement" && staticText(sourceCode, source) === "@jest/globals") {
        return { framework: "jest", kind: "namespace" };
      }
    }
    // Jest's module-mocking methods return the Jest object; Vitest's return void.
    // https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options
    const binding = testBinding(sourceCode, callee, seen);
    return (binding?.kind === "mock" || binding?.kind === "chain") && binding.framework === "jest"
      ? { framework: "jest", kind: "api" } : null;
  }
  if (expression.type !== "Identifier") return null;
  const variable = variableFor(sourceCode, expression);
  if (variable !== undefined) {
    if (seen.has(variable)) return null;
    seen.add(variable);
    const definitions = variable.defs.filter(valueDefinition);
    if (definitions.length !== 1) return null;
    const definition = definitions[0];
    if (definition.node.type === "TSImportEqualsDeclaration" && definition.node.importKind !== "type"
      && definition.node.moduleReference.type === "TSExternalModuleReference"
      && definition.node.moduleReference.expression.value === "@jest/globals") {
      return { framework: "jest", kind: "namespace" };
    }
    if (definition.node.type === "VariableDeclarator" && definition.node.init !== null
      && variable.references.every((reference) => !reference.isWrite() || reference.init)) {
      const binding = testBinding(sourceCode, definition.node.init, seen);
      return destructuredBinding(sourceCode, definition.node.id, expression.name, binding);
    }
    if (definition.parent?.type === "ImportDeclaration" && definition.parent.importKind !== "type") {
      const framework = definition.parent.source.value === "vitest" ? "vitest"
        : definition.parent.source.value === "@jest/globals" ? "jest" : null;
      if (framework === null) return null;
      const namespace: TestBinding = { framework, kind: "namespace" };
      if (definition.node.type === "ImportNamespaceSpecifier") return namespace;
      if (definition.node.type === "ImportSpecifier" && definition.node.importKind !== "type") {
        const name = definition.node.imported.type === "Identifier"
          ? definition.node.imported.name : definition.node.imported.value;
        return testMember(namespace, name);
      }
    }
    return null;
  }
  return (expression.name === "vi" || expression.name === "vitest" || expression.name === "jest")
    && unchangedGlobal(sourceCode, expression.name)
    ? { framework: expression.name === "jest" ? "jest" : "vitest", kind: "api" } : null;
}

function collectMemberWrites(target: ESTree.Node, writes: ESTree.MemberExpression[]): void {
  if (target.type === "TSAsExpression" || target.type === "TSSatisfiesExpression"
    || target.type === "TSNonNullExpression" || target.type === "TSTypeAssertion") {
    collectMemberWrites(unwrap(target), writes);
    return;
  }
  if (target.type === "MemberExpression") writes.push(target);
  if (target.type === "ObjectPattern") {
    for (const property of target.properties) {
      collectMemberWrites(property.type === "Property" ? property.value : property.argument, writes);
    }
  }
  if (target.type === "AssignmentPattern") collectMemberWrites(target.left, writes);
  if (target.type === "ArrayPattern") {
    for (const element of target.elements) {
      if (element !== null) collectMemberWrites(element, writes);
    }
  }
  if (target.type === "RestElement") collectMemberWrites(target.argument, writes);
}

export const noInternalModuleMockingRule = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Test internal modules through their real interfaces instead of mocking their imports." },
    schema: [{
      type: "object",
      properties: {
        internalModulePrefixes: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
      },
      additionalProperties: false,
    }],
    messages: { internalModuleMock: "Exercise internal modules through real dependencies or replace an external boundary instead of mocking this module." },
  },
  createOnce(context) {
    let internalPrefixes = defaultInternalPrefixes;
    const calls: ESTree.CallExpression[] = [];
    let writes: ESTree.MemberExpression[] = [];
    return {
      before() {
        calls.length = 0;
        writes = [];
        const options = context.options[0];
        internalPrefixes = options !== null && typeof options === "object" && !Array.isArray(options)
          && Array.isArray(options.internalModulePrefixes)
          ? options.internalModulePrefixes.filter((prefix): prefix is string => typeof prefix === "string")
          : defaultInternalPrefixes;
      },
      CallExpression: calls.push.bind(calls),
      AssignmentExpression(node) {
        collectMemberWrites(node.left, writes);
      },
      UnaryExpression(node) {
        const target = unwrap(node.argument);
        if (node.operator === "delete" && target.type === "MemberExpression") writes.push(target);
      },
      UpdateExpression(node) {
        const target = unwrap(node.argument);
        if (target.type === "MemberExpression") writes.push(target);
      },
      "Program:exit"() {
        // A written method loses its framework identity for this file; do not infer execution order.
        const replaced = new Set<string>();
        for (const write of writes) {
          const binding = testBinding(context.sourceCode, write.object);
          if (binding?.kind !== "api" && binding?.kind !== "namespace") continue;
          const name = memberName(context.sourceCode, write);
          if (binding.kind === "namespace" && testMember(binding, name)?.kind !== "api" && name !== null) continue;
          replaced.add(`${binding.framework}:${binding.kind === "api" && name !== null ? name : "*"}`);
        }
        for (const node of calls) {
          const callee = unwrap(node.callee);
          const callMethod = callee.type === "MemberExpression" ? memberName(context.sourceCode, callee) : null;
          const indirect = callMethod === "call" || callMethod === "apply";
          const binding = testBinding(context.sourceCode,
            callee.type === "MemberExpression" && indirect ? callee.object : callee);
          if (binding?.kind !== "mock" || replaced.has(`${binding.framework}:*`)
            || replaced.has(`${binding.framework}:${binding.method}`)) continue;
          if (indirect && node.arguments[0]?.type === "SpreadElement") continue;
          let firstArgument: ESTree.Argument | undefined = binding.boundArgument ?? node.arguments[indirect ? 1 : 0];
          if (callMethod === "apply" && binding.boundArgument === undefined) {
            const argumentsArray = firstArgument?.type === "SpreadElement" || firstArgument === undefined
              ? null : unwrap(firstArgument);
            firstArgument = argumentsArray?.type === "ArrayExpression" ? argumentsArray.elements[0] ?? undefined : undefined;
          }
          if (firstArgument === undefined || firstArgument.type === "SpreadElement") continue;
          const argument = unwrap(firstArgument);
          const specifier = argument.type === "ImportExpression" ? argument.source : argument;
          const path = staticText(context.sourceCode, specifier);
          if (path === null) continue;
          if (path === "." || path === ".." || /^[\\/]/.test(path)
            || /^file:/i.test(path)
            || /^[a-zA-Z]:[\\/]/.test(path)
            || /^\.{1,2}[\\/]/.test(path)
            || internalPrefixes.some((prefix) => path === prefix
              || (prefix.endsWith("/") || prefix === "#" ? path.startsWith(prefix) : path.startsWith(`${prefix}/`)))) {
            context.report({ node, messageId: "internalModuleMock" });
          }
        }
      },
    };
  },
});
