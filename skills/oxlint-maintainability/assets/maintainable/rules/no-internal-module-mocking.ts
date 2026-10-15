// Framework binding matching adapts anti-slop/src/rules/no-module-mocking.ts (MIT).
import { defineRule } from "@oxlint/plugins";

import type { ESTree, SourceCode } from "@oxlint/plugins";

const defaultInternalPrefixes = ["@/", "~/", "#", "@repo/"];
const mockMethods = new Set(["mock", "doMock", "setMock", "unstable_mockModule"]);

function memberName(expression: ESTree.MemberExpression): string | null {
  if (!expression.computed) return expression.property.type === "Identifier" ? expression.property.name : null;
  return expression.property.type === "Literal" && typeof expression.property.value === "string"
    ? expression.property.value : null;
}

function isTestApi(sourceCode: SourceCode, expression: ESTree.Expression): boolean {
  let identifier: ESTree.IdentifierReference;
  let namespaceExport: string | null = null;
  if (expression.type === "Identifier") {
    identifier = expression;
  } else if (expression.type === "MemberExpression"
    && expression.object.type === "Identifier" && memberName(expression) !== null) {
    identifier = expression.object;
    namespaceExport = memberName(expression);
  } else {
    return false;
  }
  let scope = sourceCode.getScope(identifier);
  while (true) {
    const variable = scope.set.get(identifier.name);
    if (variable !== undefined && variable.defs.length > 0) {
      return variable.defs.some((definition) => {
        if (definition.parent?.type !== "ImportDeclaration" || definition.parent.importKind === "type") return false;
        let name: string;
        if (namespaceExport !== null && definition.node.type === "ImportNamespaceSpecifier") {
          name = namespaceExport;
        } else if (namespaceExport === null && definition.node.type === "ImportSpecifier"
          && definition.node.importKind !== "type") {
          name = definition.node.imported.type === "Identifier"
            ? definition.node.imported.name : definition.node.imported.value;
        } else {
          return false;
        }
        return (definition.parent.source.value === "vitest" && name === "vi")
          || (definition.parent.source.value === "@jest/globals" && name === "jest");
      });
    }
    if (scope.upper === null) return namespaceExport === null && (identifier.name === "vi" || identifier.name === "jest");
    scope = scope.upper;
  }
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
    return {
      before() {
        const options = context.options[0];
        internalPrefixes = options !== null && typeof options === "object" && !Array.isArray(options)
          && Array.isArray(options.internalModulePrefixes)
          ? options.internalModulePrefixes.filter((prefix): prefix is string => typeof prefix === "string")
          : defaultInternalPrefixes;
      },
      CallExpression(node) {
        if (node.callee.type !== "MemberExpression" || !isTestApi(context.sourceCode, node.callee.object)) return;
        const method = memberName(node.callee);
        if (method === null || !mockMethods.has(method)) return;
        const argument = node.arguments[0];
        const specifier = argument?.type === "ImportExpression" ? argument.source : argument;
        let path: string;
        if (specifier?.type === "Literal" && typeof specifier.value === "string") {
          path = specifier.value;
        } else if (specifier?.type === "TemplateLiteral" && specifier.expressions.length === 0
          && specifier.quasis[0]?.value.cooked !== null && specifier.quasis[0]?.value.cooked !== undefined) {
          path = specifier.quasis[0].value.cooked;
        } else {
          return;
        }
        if (path === "." || path === ".." || path.startsWith("/")
          || /^[a-zA-Z]:[\\/]/.test(path)
          || path.startsWith("./") || path.startsWith("../")
          || internalPrefixes.some((prefix) => path === prefix
            || (prefix.endsWith("/") || prefix === "#" ? path.startsWith(prefix) : path.startsWith(`${prefix}/`)))) {
          context.report({ node, messageId: "internalModuleMock" });
        }
      },
    };
  },
});
