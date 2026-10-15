import { defineRule } from "@oxlint/plugins";

import type { ESTree, SourceCode, Variable } from "@oxlint/plugins";

// Rest creates a collection; a default adds policy along that binding path.
function* forwardedBindings(pattern: ESTree.BindingPattern): Generator<ESTree.BindingIdentifier> {
  if (pattern.type === "Identifier") {
    yield pattern;
  } else if (pattern.type === "ObjectPattern") {
    for (const property of pattern.properties) {
      if (property.type === "Property") yield* forwardedBindings(property.value);
    }
  } else if (pattern.type === "ArrayPattern") {
    for (const element of pattern.elements) {
      if (element !== null && element.type !== "RestElement") yield* forwardedBindings(element);
    }
  }
}

function findVariable(
  sourceCode: SourceCode,
  identifier: ESTree.Node & { name: string },
): Variable | null {
  let scope = sourceCode.getScope(identifier);
  while (true) {
    const variable = scope.set.get(identifier.name);
    if (variable !== undefined) return variable;
    if (scope.upper === null) return null;
    scope = scope.upper;
  }
}

function isStaticModuleSpecifier(node: ESTree.Node | undefined): boolean {
  return (node?.type === "Literal" && typeof node.value === "string")
    || (node?.type === "TemplateLiteral" && node.expressions.length === 0);
}

function isImported(
  sourceCode: SourceCode,
  identifier: ESTree.Node,
  visited = new Set<Variable>(),
): boolean {
  if (identifier.type === "TSAsExpression" || identifier.type === "TSTypeAssertion"
    || identifier.type === "TSSatisfiesExpression" || identifier.type === "TSNonNullExpression"
    || identifier.type === "ParenthesizedExpression") {
    return isImported(sourceCode, identifier.expression, visited);
  }
  if (identifier.type === "AwaitExpression") return isImported(sourceCode, identifier.argument, visited);
  if (identifier.type === "ImportExpression") return isStaticModuleSpecifier(identifier.source);
  if (identifier.type === "CallExpression" && identifier.callee.type === "Identifier"
    && identifier.callee.name === "require" && isStaticModuleSpecifier(identifier.arguments[0])) {
    const requireBinding = findVariable(sourceCode, identifier.callee);
    return requireBinding === null || requireBinding.defs.length === 0;
  }
  if (identifier.type === "TSImportType") return identifier.typeArguments === null;
  if (identifier.type === "TSTypeReference") {
    return identifier.typeArguments === null && isImported(sourceCode, identifier.typeName, visited);
  }
  if (identifier.type === "TSQualifiedName") return isImported(sourceCode, identifier.left, visited);
  if (identifier.type === "MemberExpression") {
    return (!identifier.computed || identifier.property.type === "Literal")
      && isImported(sourceCode, identifier.object, visited);
  }
  if (identifier.type !== "Identifier") return false;
  const variable = findVariable(sourceCode, identifier);
  if (variable === null || visited.has(variable)) return false;
  visited.add(variable);
  return variable.defs.some((definition) => {
    if (definition.node.type === "TSImportEqualsDeclaration") {
      return definition.node.moduleReference.type === "TSExternalModuleReference"
        || isImported(sourceCode, definition.node.moduleReference, visited);
    }
    if (definition.type === "ImportBinding") return true;
    if (definition.node.type === "TSTypeAliasDeclaration") {
      return definition.node.typeParameters === null
        && isImported(sourceCode, definition.node.typeAnnotation, visited);
    }
    if (definition.node.type !== "VariableDeclarator" || definition.parent?.type !== "VariableDeclaration"
      || (definition.parent.kind !== "const" && definition.parent.kind !== "let" && definition.parent.kind !== "var")) return false;
    const initializer = definition.node.init;
    return initializer !== null
      && !variable.references.some((reference) => reference.isWrite()
        && (!reference.init || reference.writeExpr !== initializer))
      && [...forwardedBindings(definition.node.id)].some((binding) => binding.name === identifier.name)
      && isImported(sourceCode, initializer, visited);
  });
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
      ExportNamedDeclaration(node) {
        if (node.source !== null || (node.declaration?.type === "TSImportEqualsDeclaration"
          && (node.declaration.moduleReference.type === "TSExternalModuleReference"
            || isImported(context.sourceCode, node.declaration.moduleReference)))) {
          context.report({ node, messageId: "reExport" });
          return;
        }
        if (node.declaration?.type === "TSTypeAliasDeclaration" && node.declaration.typeParameters === null
          && isImported(context.sourceCode, node.declaration.typeAnnotation)) {
          context.report({ node: node.declaration, messageId: "reExport" });
        }
        if (node.declaration?.type === "VariableDeclaration") {
          for (const declaration of node.declaration.declarations) {
            for (const binding of forwardedBindings(declaration.id)) {
              if (isImported(context.sourceCode, binding)) {
                context.report({ node: binding, messageId: "reExport" });
              }
            }
          }
        }
        for (const specifier of node.specifiers) {
          if (specifier.local.type === "Identifier" && isImported(context.sourceCode, specifier.local)) {
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
