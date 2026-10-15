import { describe, it } from "node:test";

import { RuleTester } from "oxlint/plugins-dev";

import { noInternalShapeChurnRule } from "../../../skills/oxlint-maintainability/assets/maintainable/rules/no-internal-shape-churn.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "shapeChurn" };

tester.run("maintainable/no-internal-shape-churn", noInternalShapeChurnRule, {
  valid: [{
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
