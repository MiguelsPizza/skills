import { defineRule } from "@oxlint/plugins";

import type { Definition, ESTree, SourceCode, Variable } from "@oxlint/plugins";

type Namespace = "value" | "type";

function definesNamespace(definition: Definition, namespace: Namespace): boolean {
  const node = definition.node;
  if (node.type === "ImportSpecifier" || node.type === "ImportDefaultSpecifier"
    || node.type === "ImportNamespaceSpecifier") {
    return namespace === "type" || (node.parent.type === "ImportDeclaration"
      && node.parent.importKind !== "type"
      && (node.type !== "ImportSpecifier" || node.importKind !== "type"));
  }
  if (node.type === "TSImportEqualsDeclaration") return namespace === "type" || node.importKind !== "type";
  if (node.type === "TSTypeAliasDeclaration" || node.type === "TSInterfaceDeclaration"
    || node.type === "TSTypeParameter") return namespace === "type";
  if (node.type === "ClassDeclaration" || node.type === "ClassExpression"
    || node.type === "TSEnumDeclaration" || node.type === "TSModuleDeclaration") return true;
  return namespace === "value";
}

// Rest creates a collection; a default adds policy along that binding path.
function* forwardedBindings(
  pattern: ESTree.BindingPattern,
  path: (string | undefined)[] = [],
): Generator<{ binding: ESTree.BindingIdentifier; path: (string | undefined)[] }> {
  if (pattern.type === "Identifier") {
    yield { binding: pattern, path };
  } else if (pattern.type === "ObjectPattern") {
    for (const property of pattern.properties) {
      if (property.type === "Property") {
        yield* forwardedBindings(property.value, [...path, propertyName(property.key, property.computed)]);
      }
    }
  } else if (pattern.type === "ArrayPattern") {
    for (const [index, element] of pattern.elements.entries()) {
      if (element !== null && element.type !== "RestElement") yield* forwardedBindings(element, [...path, String(index)]);
    }
  }
}

function findVariable(
  sourceCode: SourceCode,
  identifier: ESTree.Node & { name: string },
  namespace: Namespace = "value",
): Variable | null {
  let scope = sourceCode.getScope(identifier);
  while (true) {
    const variable = scope.set.get(identifier.name);
    if (variable !== undefined && (variable.defs.length === 0
      || variable.defs.some((definition) => definesNamespace(definition, namespace)))) return variable;
    if (scope.upper === null) return null;
    scope = scope.upper;
  }
}

function isStaticModuleSpecifier(node: ESTree.Node | undefined): boolean {
  return (node?.type === "Literal" && typeof node.value === "string")
    || (node?.type === "TemplateLiteral" && node.expressions.length === 0);
}

function propertyName(node: ESTree.Node, computed: boolean): string | undefined {
  if (!computed && node.type === "Identifier") return node.name;
  if (node.type === "Literal") return String(node.value);
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) {
    return node.quasis[0]?.value.cooked ?? undefined;
  }
  return undefined;
}

function memberPath(node: ESTree.Node): { root: ESTree.Node; keys: (string | undefined)[] } {
  const keys: (string | undefined)[] = [];
  while (node.type === "MemberExpression") {
    keys.unshift(propertyName(node.property, node.computed));
    node = node.object;
  }
  return { root: node, keys };
}

function isMemberModified(sourceCode: SourceCode, member: ESTree.Node, path: (string | undefined)[] = []): boolean {
  const selected = memberPath(member);
  selected.keys.push(...path);
  if (selected.keys.length === 0 || selected.root.type !== "Identifier") return false;
  const binding = findVariable(sourceCode, selected.root);
  const pending: { variable: Variable; path: (string | undefined)[] }[] = binding === null ? [] : [{ variable: binding, path: [] }];
  const visited = new Set<Variable>();
  for (const { variable, path: aliasPath } of pending) {
    if (visited.has(variable)) continue;
    visited.add(variable);
    for (const reference of variable.references) {
      let target: ESTree.Node = reference.identifier;
      while (target.parent.type === "MemberExpression" && target.parent.object === target) target = target.parent;
      const operation = target.parent;
      if (operation.type === "VariableDeclarator" && operation.init === target) {
        for (const { binding, path: bindingPath } of forwardedBindings(operation.id)) {
          const alias = findVariable(sourceCode, binding);
          const path = [...aliasPath, ...memberPath(target).keys, ...bindingPath];
          if (alias !== null && alias.defs.filter((definition) => definesNamespace(definition, "value")).length === 1
            && path.length <= selected.keys.length
            && path.every((key, index) => key === undefined || key === selected.keys[index])
            && alias.references.every((reference) => !reference.isWrite() || reference.init)) {
            pending.push({ variable: alias, path });
          }
        }
      }
      if ((operation.type === "AssignmentExpression" && operation.left === target)
        || (operation.type === "UpdateExpression" && operation.argument === target)
        || (operation.type === "UnaryExpression" && operation.operator === "delete" && operation.argument === target)) {
        const keys = memberPath(target).keys;
        const changed = [...aliasPath, ...keys];
        if (keys.length > 0 && changed.length <= selected.keys.length
          && changed.every((key, index) => key === undefined || key === selected.keys[index])) return true;
      }
    }
  }
  return false;
}

function isUnmodifiedGlobal(sourceCode: SourceCode, identifier: ESTree.Node & { name: string }): boolean {
  const binding = findVariable(sourceCode, identifier);
  if (binding !== null) return binding.defs.length === 0 && !binding.references.some((reference) => reference.isWrite());
  let scope = sourceCode.getScope(identifier);
  while (true) {
    if (scope.through.some((reference) => reference.identifier.type === "Identifier"
      && reference.identifier.name === identifier.name && reference.isWrite())) return false;
    if (scope.upper === null) return true;
    scope = scope.upper;
  }
}

function isCommonJsExport(sourceCode: SourceCode, node: ESTree.Node): boolean {
  if (node.type !== "MemberExpression") return false;
  if (node.object.type === "Identifier" && (node.object.name === "exports"
    || (node.object.name === "module" && propertyName(node.property, node.computed) === "exports"))) {
    return isUnmodifiedGlobal(sourceCode, node.object);
  }
  return isCommonJsExport(sourceCode, node.object);
}

function forwardedTypeAlias(declaration: ESTree.TSTypeAliasDeclaration): ESTree.TSType | null {
  if (declaration.typeParameters === null) return declaration.typeAnnotation;
  const annotation = declaration.typeAnnotation;
  if (annotation.type !== "TSTypeReference" && annotation.type !== "TSImportType") return null;
  const argumentsList = annotation.typeArguments?.params;
  const parameters = declaration.typeParameters.params;
  if (argumentsList?.length !== parameters.length || !parameters.every((parameter, index) => {
    const argument = argumentsList[index];
    return parameter.constraint === null && parameter.default === null && !parameter.in && !parameter.out
      && !parameter.const && argument?.type === "TSTypeReference" && argument.typeArguments === null
      && argument.typeName.type === "Identifier" && argument.typeName.name === parameter.name.name;
  })) return null;
  return annotation;
}

function isImported(
  sourceCode: SourceCode,
  identifier: ESTree.Node,
  namespace: Namespace = "value",
): boolean {
  type Kind = Namespace | "promise";
  const pending: { node: ESTree.Node; kind: Kind }[] = [{ node: identifier, kind: namespace }];
  const visited = new Map<Variable, Set<Kind>>();
  for (let work = pending.pop(); work !== undefined; work = pending.pop()) {
    const { node, kind } = work;
    if (node.type === "TSAsExpression" || node.type === "TSTypeAssertion"
      || node.type === "TSSatisfiesExpression" || node.type === "TSNonNullExpression"
      || node.type === "ParenthesizedExpression") {
      pending.push({ node: node.expression, kind });
    } else if (node.type === "AwaitExpression") {
      if (kind === "value") pending.push({ node: node.argument, kind: "promise" });
    } else if (node.type === "ImportExpression") {
      if (kind === "promise" && isStaticModuleSpecifier(node.source)) return true;
    } else if (node.type === "CallExpression" && node.callee.type === "Identifier"
      && kind === "value" && node.callee.name === "require" && isStaticModuleSpecifier(node.arguments[0])) {
      if (isUnmodifiedGlobal(sourceCode, node.callee)) return true;
    } else if (node.type === "TSImportType") {
      if (node.typeArguments === null) return true;
    } else if (node.type === "TSTypeReference") {
      if (node.typeArguments === null) pending.push({ node: node.typeName, kind: "type" });
    } else if (node.type === "TSQualifiedName") {
      pending.push({ node: node.left, kind });
    } else if (node.type === "MemberExpression") {
      if (kind === "value" && propertyName(node.property, node.computed) !== undefined
        && !isMemberModified(sourceCode, node)) pending.push({ node: node.object, kind });
    } else if (node.type === "Identifier") {
      const variable = findVariable(sourceCode, node, kind === "type" ? "type" : "value");
      if (variable === null || visited.get(variable)?.has(kind)) continue;
      const kinds = visited.get(variable) ?? new Set<Kind>();
      kinds.add(kind);
      visited.set(variable, kinds);
      const definitions = variable.defs.filter((definition) => definesNamespace(definition, kind === "type" ? "type" : "value"));
      const hasLocalType = kind === "type" && definitions.some((definition) => definition.type !== "ImportBinding"
        && definition.node.type !== "TSImportEqualsDeclaration");
      for (const definition of definitions) {
        const declaration = definition.node;
        if (declaration.type === "TSImportEqualsDeclaration" && kind !== "promise") {
          if (declaration.moduleReference.type === "TSExternalModuleReference") return true;
          pending.push({ node: declaration.moduleReference, kind });
        } else if (definition.type === "ImportBinding" && kind !== "promise" && !hasLocalType) {
          return true;
        } else if (declaration.type === "TSTypeAliasDeclaration") {
          const annotation = forwardedTypeAlias(declaration);
          if (annotation === null) continue;
          if (declaration.typeParameters !== null) {
            if (annotation.type === "TSImportType") return true;
            if (annotation.type === "TSTypeReference") pending.push({ node: annotation.typeName, kind: "type" });
          } else {
            pending.push({ node: annotation, kind: "type" });
          }
        } else if (declaration.type === "VariableDeclarator" && definition.parent?.type === "VariableDeclaration"
          && (definition.parent.kind === "const" || definition.parent.kind === "let" || definition.parent.kind === "var")) {
          const initializer = declaration.init;
          const forwarded = [...forwardedBindings(declaration.id)].find(({ binding }) => binding.name === node.name);
          if (initializer !== null && forwarded !== undefined
            && (kind !== "promise" || forwarded.path.length === 0)
            && !variable.references.some((reference) => reference.isWrite()
              && (!reference.init || reference.writeExpr !== initializer))
            && !isMemberModified(sourceCode, initializer, forwarded.path)) pending.push({ node: initializer, kind });
        }
      }
    }
  }
  return false;
}

export const noReExportsRule = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Export locally owned declarations; import other declarations from their owner." },
    schema: [],
    messages: { reExport: "Import this declaration from its owning module instead of re-exporting it." },
  },
  createOnce(context) {
    return {
      AssignmentExpression(node) {
        if (node.operator === "=" && isCommonJsExport(context.sourceCode, node.left)
          && isImported(context.sourceCode, node.right)) {
          context.report({ node, messageId: "reExport" });
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source !== null || (node.declaration?.type === "TSImportEqualsDeclaration"
          && (node.declaration.moduleReference.type === "TSExternalModuleReference"
            || isImported(context.sourceCode, node.declaration.moduleReference)))) {
          context.report({ node, messageId: "reExport" });
          return;
        }
        if (node.declaration?.type === "TSTypeAliasDeclaration"
          && isImported(context.sourceCode, node.declaration.id, "type")) {
          context.report({ node: node.declaration, messageId: "reExport" });
        }
        if (node.declaration?.type === "VariableDeclaration") {
          for (const declaration of node.declaration.declarations) {
            for (const { binding } of forwardedBindings(declaration.id)) {
              if (isImported(context.sourceCode, binding)) {
                context.report({ node: binding, messageId: "reExport" });
              }
            }
          }
        }
        for (const specifier of node.specifiers) {
          if (specifier.local.type === "Identifier"
            && ((node.exportKind !== "type" && specifier.exportKind !== "type"
              && isImported(context.sourceCode, specifier.local))
              || isImported(context.sourceCode, specifier.local, "type"))) {
            context.report({ node: specifier, messageId: "reExport" });
          }
        }
      },
      ExportDefaultDeclaration(node) {
        if (isImported(context.sourceCode, node.declaration)) {
          context.report({ node, messageId: "reExport" });
        }
      },
      TSExportAssignment(node) {
        if (isImported(context.sourceCode, node.expression)) {
          context.report({ node, messageId: "reExport" });
        }
      },
      ExportAllDeclaration(node) {
        context.report({ node, messageId: "reExport" });
      },
    };
  },
});
