import { defineRule } from "@oxlint/plugins";
import type { ESTree } from "@oxlint/plugins";

function isStableCallee(node: ESTree.Expression | ESTree.Super | ESTree.V8IntrinsicExpression): boolean {
  if (node.type === "Identifier" || node.type === "ThisExpression") return true;
  return node.type === "MemberExpression" && !node.computed && isStableCallee(node.object);
}

export const noTrivialForwardingWrapperRule = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Review transparent wrappers that add no policy or ownership.",
      url: "https://github.com/MiguelsPizza/skills/blob/main/skills/maintainable-typescript/doctrine/deletion/delete-fake-layers.md",
    },
    schema: [],
    messages: {
      forwarding: "This wrapper only forwards arguments. Review policy, validation, lifecycle, error translation, or meaningful transformation; otherwise call its owner directly. See https://github.com/MiguelsPizza/skills/blob/main/skills/maintainable-typescript/doctrine/deletion/delete-fake-layers.md. Suppress an intentional boundary with a reason.",
    },
  },
  createOnce(context) {
    function inspect(node: ESTree.Function | ESTree.ArrowFunctionExpression) {
      if (node.body === null || node.generator) return;
      if (node.parent.type === "MethodDefinition" && node.parent.decorators.length > 0) return;
      if (node.params.some(parameter => (parameter.decorators?.length ?? 0) > 0)) return;
      let expression: ESTree.Expression | null;
      if (node.body.type === "BlockStatement") {
        const statements = node.body.body;
        if (statements.length !== 1) return;
        const statement = statements[0];
        if (statement?.type === "ReturnStatement") expression = statement.argument;
        else if (statement?.type === "ExpressionStatement") expression = statement.expression;
        else return;
      } else {
        expression = node.body;
      }
      if (expression?.type === "AwaitExpression") expression = expression.argument;
      if (expression?.type !== "CallExpression") return;
      if (!isStableCallee(expression.callee)) return;
      if (node.params.length !== expression.arguments.length) return;
      const argumentsList = expression.arguments;
      if (!node.params.every((parameter, index) => {
        const argument = argumentsList[index];
        if (parameter.type === "RestElement") {
          return parameter.argument.type === "Identifier" && argument?.type === "SpreadElement" &&
            argument.argument.type === "Identifier" && parameter.argument.name === argument.argument.name;
        }
        return parameter.type === "Identifier" && argument?.type === "Identifier" && parameter.name === argument.name;
      })) return;
      context.report({ node, messageId: "forwarding" });
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
    };
  },
});
