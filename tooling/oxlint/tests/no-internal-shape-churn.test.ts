import { describe, it } from "node:test";

import { RuleTester } from "oxlint/plugins-dev";

import { noInternalShapeChurnRule } from "../../../skills/oxlint-maintainability/assets/maintainable/rules/no-internal-shape-churn.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "shapeChurn" };

tester.run("maintainable/no-internal-shape-churn", noInternalShapeChurnRule, {
  valid: [{
    name: "quoted prototype setter changes the result prototype",
    code: `const withPrototype = (input: InstallationPrototype) => ({ '__proto__': input['__proto__'] });`,
  }, {
    name: "returned getter retains lazy property evaluation",
    code: `const toTarget = (input: Installation) => ({ get installationId() { return input.installationId; } });`,
  }, {
    name: "dynamic output key evaluates a policy function",
    code: `const toTarget = (input: Installation) => ({ [chooseTargetField()]: input.installationId });`,
  }, {
    name: "dynamic source key evaluates a policy function",
    code: `const toTarget = (input: Installation) => ({ installationId: input[chooseTargetField()] });`,
  }, {
    name: "destructuring default performs a meaningful fallback",
    code: `function toTarget(input: Installation) {
      const { installationId = allocateInstallationId(), ...target } = input;
      return target;
    }`,
  }, {
    name: "computed omitted key evaluates additional policy",
    code: `function toTarget(input: Installation) {
      const { [choosePrivateField()]: omitted, ...target } = input;
      return target;
    }`,
  }, {
    name: "conditional spread preserves optional property presence",
    code: `function toTarget(input: Installation) {
      return { ...(input.archivedAt === undefined ? {} : { archivedAt: input.archivedAt }) };
    }`,
  }, {
    name: "decorated field carries serialization policy",
    code: `class Serializer { @redactPrivateFields toPayload = (input: Installation) => ({ installationId: input.installationId }); }`,
  }, {
    name: "parameter decorator validates the projected input",
    code: `class Serializer { toPayload(@validateInstallation input: Installation) { return { installationId: input.installationId }; } }`,
  }, {
    name: "getter owns deferred projection lifecycle",
    code: `class Serializer { get target() { return { installationId: this.installation.installationId }; } }`,
  }, {
    name: "async projection owns a promise boundary",
    code: `async function toTarget(input: Installation) { return { installationId: input.installationId }; }`,
  }, {
    name: "generator owns lazy projection lifecycle",
    code: `function* toTarget(input: Installation) { return { installationId: input.installationId }; }`,
  }, {
    name: "local generic class owns a type contract",
    code: `class Pick<T, Policy> { installation!: T; policy!: Policy; }
      type Selection = Pick<Installation, InstallationPolicy>;`,
  }, {
    name: "local interface owns a type contract",
    code: `interface Omit<T, Policy> { installation: T; policy: Policy; }
      type Selection = Omit<Installation, InstallationPolicy>;`,
  }, {
    name: "object prototype setter performs a runtime transformation",
    code: `function withInstallationPrototype(input: InstallationPrototype) {
      return { __proto__: input.__proto__ };
    }`,
  }, {
    name: "import-equals type alias is a domain contract",
    code: `namespace InstallationContracts { export type Pick<T, K> = { selected: T; field: K }; }
      import Pick = InstallationContracts.Pick;
      type Selection = Pick<RepositoryInstallation, InstallationSource>;`,
  }, {
    name: "decorated projection method carries serialization policy",
    code: "class Serializer { @redactPrivateFields toPayload(input: User) { return { id: input.id }; } }",
  }, {
    name: "local Pick is a domain contract rather than the built-in utility",
    code: `type Pick<T, Field> = { selected: T; source: Field };
      type InstallationSelection = Pick<RepositoryInstallation, InstallationSource>;`,
  },
    `import type { Omit } from './domain-contracts'; type SyncTarget = Omit<RepositoryInstallation, SyncPolicy>;`,
    `function withSelection<Pick>(input: Pick<RepositoryInstallation, InstallationSource>) { return input; }`,
    `namespace Domain { export type Pick<T, K> = { value: T; key: K }; }
      type Selection = Domain.Pick<RepositoryInstallation, InstallationSource>;`,
    `const installationInputSchema = installationSchema.pick({ installationId: true, repositoryName: true });`,
    `const installationUpdateSchema = installationSchema.omit({ archivedAt: true });`,
    `const updateInstallation = (installation: RepositoryInstallation) => ({ ...installation, archivedAt: new Date() });`,
    `function createSyncPayload(installation: RepositoryInstallation) {
      return { installationId: installation.installationId, mode: installation.visibility === 'private' ? 'full' : 'metadata' };
    }`,
    `function createInstallationResponse(installation: RepositoryInstallation) {
      const response = { installationId: installation.installationId };
      if (installation.archivedAt !== undefined) response.archivedAt = installation.archivedAt;
      return response;
    }`,
  ],
  invalid: [{
    name: "computed literal output key preserves a projection",
    code: `const toTarget = (input: Installation) => ({ ['installationId']: input.installationId });`,
    errors: [error],
  }, {
    name: "computed proto name creates an own field rather than setting a prototype",
    code: `const toTarget = (input: InstallationPrototype) => ({ ['__proto__']: input['__proto__'] });`,
    errors: [error],
  }, {
    name: "default-exported arrow only projects canonical fields",
    code: `export default (input: Installation) => ({ installationId: input.installationId });`,
    errors: [error],
  }, {
    name: "default-exported function only projects canonical fields",
    code: `export default function(input: Installation) { return { installationId: input.installationId }; }`,
    errors: [error],
  }, {
    name: "aliased omitted binding still removes only the canonical field",
    code: `function toTarget(input: Installation) {
      const { archivedAt: unusedArchiveTime, ...target } = input;
      return target;
    }`,
    errors: [error],
  }, {
    name: "literal property names preserve the same projection",
    code: `const toTarget = (input: Installation) => ({ 'installationId': input['installationId'] });`,
    errors: [error],
  }, {
    name: "class field only projects canonical fields",
    code: "class Helpers { toTarget = (input: Installation) => ({ id: input.id }); }",
    errors: [error],
  }, {
    name: "object arrow property only projects canonical fields",
    code: "const helpers = { toTarget: (input: Installation) => ({ id: input.id }) };",
    errors: [error],
  }, {
    name: "object method only projects canonical fields",
    code: "const helpers = { toTarget(input: Installation) { return { id: input.id }; } };",
    errors: [error],
  }, {
    name: "class method only projects canonical fields",
    code: "class Helpers { toTarget(input: Installation) { return { id: input.id }; } }",
    errors: [error],
  }, {
    name: "bound function expression only projects canonical fields",
    code: "const toTarget = function(input: Installation) { return { id: input.id }; };",
    errors: [error],
  }, {
    name: "helper invents a subset of the owned installation",
    code: `type UpstreamTarget = Pick<RepositoryInstallation, 'upstreamServerId'>;`,
    errors: [error],
  }, {
    name: "helper removes lifecycle state from the owned installation",
    code: `type InstallationSyncInput = Omit<RepositoryInstallation, 'archivedAt'>;`,
    errors: [error],
  }, {
    name: "a value named Pick does not shadow the built-in type utility",
    code: `const Pick = chooseInstallation;
      type UpstreamTarget = Pick<RepositoryInstallation, 'upstreamServerId'>;`,
    errors: [error],
  }, {
    name: "projection helper only copies fields from the canonical installation",
    code: `function toUpstreamTarget(installation: RepositoryInstallation) {
      return { upstreamServerId: installation.upstreamServerId };
    }`,
    errors: [error],
  }, {
    name: "rest helper only strips internal installation state",
    code: `function toSyncInput(installation: RepositoryInstallation) {
      const { archivedAt, connectedByUserId, ...syncInput } = installation;
      return syncInput;
    }`,
    errors: [error],
  }, {
    name: "named arrow only creates a subset installation shape",
    code: `const toUpstreamTarget = (installation: RepositoryInstallation) => ({
      upstreamServerId: installation.upstreamServerId,
      tenantId: installation.tenantId,
    });`,
    errors: [error],
  }],
});
