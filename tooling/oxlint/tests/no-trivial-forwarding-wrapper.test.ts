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
      name: "static template implementation matches a literal predicate overload",
      code: "class InstallationPolicy { isActive(input: unknown): input is ActiveInstallation; [`isActive`](input: unknown) { return installationSchema.safeCheck(input); } }",
    },
    {
      name: "escaped template method name matches its cooked predicate name",
      code: "class InstallationPolicy { [`\\u0069sActive`](input: unknown): input is ActiveInstallation; isActive(input: unknown) { return installationSchema.safeCheck(input); } }",
    },
    {
      name: "static template method overload establishes caller-visible narrowing",
      code: "class InstallationPolicy { [`isActive`](input: unknown): input is ActiveInstallation; isActive(input: unknown) { return installationSchema.safeCheck(input); } }",
    },
    {
      name: "overloaded explicit receiver contract is preserved",
      code: `function persistInstallation(this: InstallationRepository, input: InstallationInput): Installation;
        function persistInstallation(input: InstallationInput) { return this.saveInstallation(input); }`,
    },
    {
      name: "private predicate overload establishes caller narrowing",
      code: `class InstallationPolicy {
        #isActive(input: unknown): input is ActiveInstallation;
        #isActive(input: unknown) { return installationSchema.safeCheck(input); }
      }`,
    },
    {
      name: "literal method overload establishes caller-visible narrowing",
      code: `class InstallationPolicy {
        ['isActive'](input: unknown): input is ActiveInstallation;
        isActive(input: unknown) { return installationSchema.safeCheck(input); }
      }`,
    },
    {
      name: "overloaded method establishes caller-visible narrowing",
      code: `class InstallationPolicy {
        isActive(input: unknown): input is ActiveInstallation;
        isActive(input: unknown) { return installationSchema.safeCheck(input); }
      }`,
    },
    {
      name: "overloaded predicate establishes caller-visible narrowing",
      code: `function isActiveInstallation(input: unknown): input is ActiveInstallation;
        function isActiveInstallation(input: unknown) { return installationSchema.safeCheck(input); }`,
    },
    {
      name: "assertion function establishes validated input",
      code: `function assertInstallation(input: unknown): asserts input is Installation {
        installationSchema.assert(input);
      }`,
    },
    {
      name: "class field predicate establishes caller narrowing",
      code: `class InstallationPolicy {
        isActive: (input: unknown) => input is ActiveInstallation = input => installationSchema.safeCheck(input);
      }`,
    },
    {
      name: "decorated field owns logging policy",
      code: `class InstallationService { @logOperation save = (input: InstallationInput) => persistInstallation(input); }`,
    },
    {
      name: "parameter decorator establishes validation policy",
      code: `class InstallationService { save(@validateInstallation input: InstallationInput) { return persistInstallation(input); } }`,
    },
    {
      name: "using declaration owns resource disposal",
      code: `function persistInstallation(input: InstallationInput) {
        using lease = acquireInstallationLease(input.installationId);
        return saveRepositoryInstallation(input);
      }`,
    },
    {
      name: "arguments count changes the forwarded contract",
      code: `function persistInstallation(input?: InstallationInput) {
        return saveRepositoryInstallation(input, arguments.length);
      }`,
    },
    {
      name: "receiver restoration is an actual argument adaptation",
      code: `const persistInstallation = (input: InstallationInput) => repository.save.call(repository, input);`,
    },
    {
      name: "dynamic writer selection evaluates additional policy",
      code: `const persistInstallation = (input: InstallationInput) => repository[chooseWriter(input)](input);`,
    },
    {
      name: "optional invocation guards an unavailable writer",
      code: `const persistInstallation = (input: InstallationInput) => repository.save?.(input);`,
    },
    {
      name: "tuple reordering is a meaningful argument transformation",
      code: `const persistInstallation = (...args: [InstallationInput, AuditContext]) => saveRepositoryInstallation(args[1], args[0]);`,
    },
    {
      name: "rest slicing changes the forwarded tuple",
      code: `const persistInstallation = (...args: [AuditContext, ...InstallationInput[]]) => saveRepositoryInstallation(...args.slice(1));`,
    },
    {
      name: "async generator owns lazy iteration",
      code: `async function* persistInstallation(input: InstallationInput) { return saveRepositoryInstallation(input); }`,
    },
    {
      name: "destructured input changes property evaluation",
      code: `function persistInstallation({ installationId }: InstallationInput) { return saveRepositoryInstallation(installationId); }`,
    },
    {
      name: "contextual this annotation preserves the required receiver",
      code: `const persistInstallation: (this: InstallationRepository, input: InstallationInput) => Installation =
        function(input) { return this.saveInstallation(input); };`,
    },
    {
      name: "explicit this contract preserves the required receiver",
      code: `function persistInstallation(this: InstallationRepository, input: InstallationInput) {
        return this.saveInstallation(input);
      }`,
    },
    {
      name: "parenthesized contextual predicate keeps its narrowing contract",
      code: `const isActiveInstallation: ((input: unknown) => input is ActiveInstallation) =
        input => installationSchema.safeCheck(input);`,
    },
    {
      name: "contextual assertion annotation establishes a caller-visible contract",
      code: `const assertActiveInstallation: (input: unknown) => asserts input is ActiveInstallation =
        input => installationSchema.assert(input);`,
    },
    {
      name: "forwarded predicate establishes a caller-visible narrowing contract",
      code: `function isActiveInstallation(input: unknown): input is ActiveInstallation {
        return installationSchema.safeCheck(input);
      }`,
    },
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
    name: "unrelated template predicate overload cannot suppress another method",
    code: "class InstallationPolicy { [`isEnabled`](input: unknown): input is ActiveInstallation; isEnabled(input: unknown) { return installationSchema.safeCheck(input); } isActive(input: unknown) { return installationSchema.safeCheck(input); } }",
    errors: [error],
  }, {
    name: "static predicate overload cannot suppress unrelated instance delegation",
    code: `class InstallationPolicy {
      static isActive(input: unknown): input is ActiveInstallation;
      static isActive(input: unknown) { return installationSchema.safeCheck(input); }
      isActive(input: unknown) { return installationSchema.safeCheck(input); }
    }`,
    errors: [error],
  }, {
    name: "public predicate overload cannot suppress unrelated private delegation",
    code: `class InstallationPolicy {
      isActive(input: unknown): input is ActiveInstallation;
      isActive(input: unknown) { return installationSchema.safeCheck(input); }
      #isActive(input: unknown) { return installationSchema.safeCheck(input); }
    }`,
    errors: [error],
  }, {
    name: "typed async delegation remains a review warning",
    code: `const persistInstallation = async (input: InstallationInput): Promise<Installation> =>
      await saveRepositoryInstallation(input);`,
    errors: [error],
  }, {
    name: "class arrow receiver delegation remains a review warning",
    code: `class InstallationService { save = (input: InstallationInput) => this.repository.save(input); }`,
    errors: [error],
  }, {
    name: "mixed ordinary and rest parameters forward the original tuple",
    code: `const persistInstallation = (input: InstallationInput, ...audit: AuditEntry[]) => saveRepositoryInstallation(input, ...audit);`,
    errors: [error],
  }, {
    name: "optional input remains a reviewable contract rather than proof of ownership",
    code: `function persistInstallation(input?: InstallationInput) { return saveRepositoryInstallation(input); }`,
    errors: [error],
  }, {
    name: "literal method lookup preserves direct delegation",
    code: `const persistInstallation = (input: InstallationInput) => repository['saveInstallation'](input);`,
    errors: [error],
  }, {
    name: "anonymous default-exported function forwards canonical input",
    code: "export default function(input: InstallationInput) { return persistInstallation(input); }",
    errors: [error],
  }, {
    name: "class field forwards canonical input",
    code: "class InstallationService { save = (input: InstallationInput) => persistInstallation(input); }",
    errors: [error],
  }, {
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
