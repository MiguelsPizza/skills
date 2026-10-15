import { describe, it } from "node:test";

import { RuleTester } from "oxlint/plugins-dev";

import { noInternalShapeChurnRule } from "../../../skills/oxlint-maintainability/assets/maintainable/rules/no-internal-shape-churn.ts";
import { noTrivialForwardingWrapperRule } from "../../../skills/oxlint-maintainability/assets/maintainable/rules/no-trivial-forwarding-wrapper.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });

// The same workflow in supported declaration forms must keep the same decision.
const containers = [
  ["function", "function persistInstallation(installation: InstallationInput, audit: AuditContext) { return EXPRESSION; }"],
  ["arrow", "const persistInstallation = (installation: InstallationInput, audit: AuditContext) => EXPRESSION;"],
  ["function expression", "const persistInstallation = function(installation: InstallationInput, audit: AuditContext) { return EXPRESSION; };"],
  ["method", "class InstallationService { persistInstallation(installation: InstallationInput, audit: AuditContext) { return EXPRESSION; } }"],
  ["field", "class InstallationService { persistInstallation = (installation: InstallationInput, audit: AuditContext) => EXPRESSION; }"],
  ["object method", "const service = { persistInstallation(installation: InstallationInput, audit: AuditContext) { return EXPRESSION; } };"],
  ["object field", "const service = { persistInstallation: (installation: InstallationInput, audit: AuditContext) => EXPRESSION };"],
  ["default arrow", "export default (installation: InstallationInput, audit: AuditContext) => EXPRESSION;"],
  ["default function expression", "export default (function(installation: InstallationInput, audit: AuditContext) { return EXPRESSION; });"],
] as const;

tester.run("forwarding syntax and argument metamorphisms", noTrivialForwardingWrapperRule, {
  valid: containers.flatMap(([name, template]) => [
    {
      name: `${name} changes argument order`,
      code: template.replace("EXPRESSION", "saveRepositoryInstallation(audit, installation)"),
    },
    {
      name: `${name} validates the input`,
      code: template.replace("EXPRESSION", "saveRepositoryInstallation(installationSchema.parse(installation), audit)"),
    },
    {
      name: `${name} transforms the promise result`,
      code: template.replace("EXPRESSION", "saveRepositoryInstallation(installation, audit).then(result => result.installationId)"),
    },
  ]),
  invalid: containers.map(([name, template]) => ({
    name: `${name} delegates both canonical arguments`,
    code: template.replace("EXPRESSION", "saveRepositoryInstallation(installation, audit)"),
    errors: [{ messageId: "forwarding" }],
  })),
});

const utilityNames = ["Pick", "Omit"] as const;
tester.run("shape utility type and value namespace isolation", noInternalShapeChurnRule, {
  valid: utilityNames.flatMap(name => [
    {
      name: `${name} local type remains visible through a nearer value binding`,
      code: `type ${name}<T, K> = { installation: T; policy: K };
        function selectInstallation(${name}: SelectionPolicy) {
          type Selection = ${name}<Installation, Policy>;
          return ${name};
        }`,
    },
    {
      name: `${name} import alias owns a type contract`,
      code: `namespace Contracts { export type Selection<T, K> = { installation: T; policy: K }; }
        import ${name} = Contracts.Selection;
        type Selection = ${name}<Installation, Policy>;`,
    },
    {
      name: `${name} imported contract is unresolved rather than assumed global`,
      code: `import { ${name} } from './selection-contract';
        type Selection = ${name}<Installation, Policy>;`,
    },
  ]),
  invalid: utilityNames.flatMap(name => [
    {
      name: `${name} built-in after another test defined a local type`,
      code: `type InstallationTarget = ${name}<Installation, 'installationId'>;`,
      errors: [{ messageId: "shapeChurn" }],
    },
    {
      name: `${name} value parameter leaves built-in type visible`,
      code: `function selectInstallation(${name}: SelectionPolicy) {
        type Selection = ${name}<Installation, 'installationId'>;
        return ${name};
      }`,
      errors: [{ messageId: "shapeChurn" }],
    },
    {
      name: `${name} local value function leaves built-in type visible`,
      code: `function ${name}(installation: Installation) {
        if (!installation.archivedAt) return installation.installationId;
        return null;
      }
      type InstallationTarget = ${name}<Installation, 'installationId'>;`,
      errors: [{ messageId: "shapeChurn" }],
    },
  ]),
});
