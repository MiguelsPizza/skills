import { defineRule } from "@oxlint/plugins";
import type { ESTree, Scope } from "@oxlint/plugins";

function isTransparentProjection(expression: ESTree.Expression | null, parameter: string): boolean {
  if (expression?.type !== "ObjectExpression" || expression.properties.length === 0) return false;
  return expression.properties.every(property => {
    if (property.type !== "Property" || property.computed || property.kind !== "init") return false;
    const value = property.value;
    return property.key.type === "Identifier" && value.type === "MemberExpression" &&
      !value.computed && value.object.type === "Identifier" && value.object.name === parameter &&
      value.property.type === "Identifier" && value.property.name === property.key.name;
  });
}

export const noInternalShapeChurnRule = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Review utility types and transparent projections that duplicate canonical internal shapes.",
      url: "https://github.com/MiguelsPizza/skills/blob/main/skills/maintainable-typescript/doctrine/deletion/delete-fake-layers.md",
    },
    schema: [],
    messages: {
      shapeChurn: "Review this narrower shape against the canonical owned type. Keep it only for a real boundary, invariant, or meaningful transformation. See https://github.com/MiguelsPizza/skills/blob/main/skills/maintainable-typescript/doctrine/deletion/delete-fake-layers.md. Suppress an intentional contract with a reason.",
    },
  },
  createOnce(context) {
    function inspect(node: ESTree.Function | ESTree.ArrowFunctionExpression) {
      if (node.async || node.generator || node.params.length !== 1) return;
      if (node.parent.type === "MethodDefinition" && node.parent.decorators.length > 0) return;
      if (node.params.some(parameter => (parameter.decorators?.length ?? 0) > 0)) return;
      const parameter = node.params[0];
      if (parameter?.type !== "Identifier") return;
      if (node.body !== null && node.body.type !== "BlockStatement") {
        if (isTransparentProjection(node.body, parameter.name)) context.report({ node, messageId: "shapeChurn" });
        return;
      }
      const statements = node.body?.body;
      if (statements?.length === 1 && statements[0]?.type === "ReturnStatement" &&
        isTransparentProjection(statements[0].argument, parameter.name)) {
        context.report({ node, messageId: "shapeChurn" });
        return;
      }
      if (statements?.length !== 2 || statements[0]?.type !== "VariableDeclaration" || statements[1]?.type !== "ReturnStatement") return;
      if (statements[0].declarations.length !== 1) return;
      const declaration = statements[0].declarations[0];
      if (declaration?.id.type !== "ObjectPattern" || declaration.init?.type !== "Identifier" || declaration.init.name !== parameter.name) return;
      const properties = declaration.id.properties;
      if (properties.length < 2 || !properties.every(property => property.type === "RestElement" ||
        (!property.computed && property.value.type === "Identifier"))) return;
      const rest = properties.at(-1);
      if (rest?.type !== "RestElement" || rest.argument.type !== "Identifier") return;
      const returned = statements[1].argument;
      if (returned?.type === "Identifier" && returned.name === rest.argument.name) {
        context.report({ node, messageId: "shapeChurn" });
      }
    }
    return {
      FunctionDeclaration: inspect,
      ArrowFunctionExpression(node) {
        if (node.parent.type === "VariableDeclarator" && node.parent.id.type === "Identifier") inspect(node);
        else if (node.parent.type === "Property" && node.parent.kind === "init") inspect(node);
      },
      FunctionExpression(node) {
        if (node.parent.type === "MethodDefinition" && node.parent.kind === "method") inspect(node);
        else if (node.parent.type === "Property" && node.parent.kind === "init") inspect(node);
        else if (node.parent.type === "VariableDeclarator" && node.parent.id.type === "Identifier") inspect(node);
      },
      TSTypeReference(node) {
        if (node.typeName.type !== "Identifier") return;
        if (node.typeName.name !== "Pick" && node.typeName.name !== "Omit") return;
        let scope: Scope | null = context.sourceCode.getScope(node);
        while (scope !== null) {
          if (scope.set.get(node.typeName.name)?.defs.some(definition => {
            const type = definition.node.type;
            return definition.type === "ImportBinding" || type === "TSTypeAliasDeclaration" ||
              type === "TSInterfaceDeclaration" || type === "TSTypeParameter" ||
              type === "ClassDeclaration" || type === "ClassExpression" || type === "TSEnumDeclaration";
          })) return;
          scope = scope.upper;
        }
        context.report({ node, messageId: "shapeChurn" });
      },
    };
  },
});
