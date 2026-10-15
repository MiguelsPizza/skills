import { describe, it } from "node:test";

import { RuleTester } from "oxlint/plugins-dev";

import { noTrivialForwardingWrapperRule } from "../../../skills/oxlint-maintainability/assets/maintainable/rules/no-trivial-forwarding-wrapper.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "forwarding" };

tester.run("maintainable/no-trivial-forwarding-wrapper", noTrivialForwardingWrapperRule, {
  valid: [
    {
      name: "creation workflow owns persistence and sync policy",
      code: `export async function createRepositoryInstallation(input: CreateRepositoryInstallationInput): Promise<RepositoryInstallation> {
        const installation = await saveRepositoryInstallation({
          installationId: input.installationId,
          repositoryName: input.repositoryName,
          visibility: input.visibility,
        });
        const syncMode = chooseInitialSyncMode(installation);
        if (syncMode !== 'skip') {
          await queueRepositorySync({ installationId: installation.installationId, mode: syncMode });
        }
        return installation;
      }
      function chooseInitialSyncMode(installation: RepositoryInstallation): 'full' | 'metadata' | 'skip' {
        if (installation.archivedAt) return 'skip';
        if (installation.visibility === 'private') return 'full';
        return 'metadata';
      }`,
    },
    `function saveInstallation(input: unknown) { return saveRepositoryInstallation(installationSchema.parse(input)); }`,
    `async function saveInstallation(input: CreateRepositoryInstallationInput) {
      await authorizeInstallation(input.installationId);
      return saveRepositoryInstallation(input);
    }`,
    `async function syncInstallation(input: RepositoryInstallation) {
      const client = await connectUpstreamClient(input.upstreamServerId);
      try { return await client.syncRepository(input.repositoryId); }
      finally { await client.close(); }
    }`,
    `async function saveInstallation(input: CreateRepositoryInstallationInput) {
      try { return await saveRepositoryInstallation(input); }
      catch (cause) { throw new InstallationSaveError({ cause }); }
    }`,
    `const saveInstallation = (input = defaultInstallationInput) => saveRepositoryInstallation(input);`,
    `const persistAll = installations.map(installation => saveRepositoryInstallation(installation));`,
    `class InstallationService { get installation() { return this.repository.currentInstallation(); } }`,
    `function saveInstallation(input: CreateRepositoryInstallationInput) {
      return repositoryForTenant(input.tenantId).saveInstallation(input);
    }`,
    `function* deferredInstallation(input: RepositoryInstallation) { return prepareInstallation(input); }`,
    `class InstallationService {
      @authorizeInstallation
      saveInstallation(input: CreateRepositoryInstallationInput) { return this.repository.saveInstallation(input); }
    }`,
  ],
  invalid: [{
    name: "arrow property only forwards canonical input",
    code: "const handlers = { save: (input: InstallationInput) => persistInstallation(input) };",
    errors: [error],
  }, {
    name: "installation helper only delegates persistence",
    code: `export async function createRepositoryInstallation(input: CreateRepositoryInstallationInput) {
      return await saveRepositoryInstallation(input);
    }`,
    errors: [error],
  }, {
    name: "named arrow duplicates repository writer",
    code: `const persistInstallation = (input: CreateRepositoryInstallationInput) => saveRepositoryInstallation(input);`,
    errors: [error],
  }, {
    name: "class method only delegates the canonical input",
    code: `class InstallationService {
      saveInstallation(input: CreateRepositoryInstallationInput) { return this.repository.saveInstallation(input); }
    }`,
    errors: [error],
  }, {
    name: "framework handler is a reviewable adapter",
    code: `const installationHandlers = {
      saveInstallation(input: CreateRepositoryInstallationInput) { return saveRepositoryInstallation(input); },
    };`,
    errors: [error],
  }, {
    name: "void wrapper still adds no work",
    code: `function queueInstallationSync(input: SyncRepositoryInput): void { queueRepositorySync(input); }`,
    errors: [error],
  }, {
    name: "named function expression only forwards storage arguments",
    code: `const persistInstallation = function(input: CreateRepositoryInstallationInput) {
      return saveRepositoryInstallation(input);
    };`,
    errors: [error],
  }, {
    name: "rest wrapper only forwards the complete canonical argument tuple",
    code: `const persistInstallation = (...args: Parameters<typeof saveRepositoryInstallation>) => saveRepositoryInstallation(...args);`,
    errors: [error],
  }],
});
