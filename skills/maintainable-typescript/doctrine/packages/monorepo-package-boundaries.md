---
example:
  primary: monorepo-package-boundaries
  format: code
  implements:
    - monorepo-package-boundaries
    - no-re-exports
    - no-premature-abstractions
---
# Monorepo Package Boundaries

**Rule:** Give packages one purpose, tests, and explicit public entrypoints. Packages never import from apps; shared packages never import from domain packages. Keep runtime behavior in apps by default and canonical contracts in their established packages.

See also: [No Premature Abstractions](../abstractions/no-premature-abstractions.md), [Build Deep Modules, Not Shallow Abstractions](../abstractions/build-deep-modules-not-shallow-abstractions.md), and [No Re-exports](./no-re-exports.md).

## Why agents get this wrong

Extracting a package for one app adds a boundary without a second consumer. Imports from apps into packages or from the wrong layer reverse ownership and can create cycles.

## What to do instead

Keep ordinary runtime code in the app until there is a second real consumer. For foundational auth, security, or protocol code, follow [Treat Critical Code Like a Library](../foundations/treat-critical-code-like-a-library.md). When extraction is justified, expose leaf modules through `package.json` subpath exports and keep dependency flow one-way.

Keep canonical schemas and Zod contracts in their established packages, even with one consuming app. Apps own route handlers, session behavior, and local orchestration.

Import style should reinforce those boundaries:

- use package imports across package boundaries, never relative filesystem hops between packages
- use app-local aliases such as `@/` for nonlocal imports inside an app
- keep relative imports for genuinely local neighbors inside the same area

Export coherent modules such as `./review-runs/review-run`. Split them when unrelated responsibilities accumulate, then expose the new owners.

Use directories for feature or domain boundaries and files for coherent behavior: routes, contracts, persistence, client wrappers, or session/cookie subsystems. Keep related helpers together.

Use this boundary model:

```
packages/contracts/
packages/db/
apps/web/
apps/api/
```

Extract shared runtime code when two or more apps need it, the contract is clear and testable, and public entrypoints can be explicit. Follow established package ownership for canonical contracts.

Do not create a package when:

- Only one app uses ordinary runtime code
- The utilities have no coherent domain, as in `packages/utils`
- Consumers are speculative
- The only reason is to colocate runtime behavior with a schema

## Example

Directory layout

```text
apps/web/src/features/review-runs/create-review-run-form.tsx
apps/api/src/routes/review-runs.ts
apps/api/src/features/review-runs/create-review-run.ts
packages/contracts/src/review-runs/create-review-run.ts
packages/contracts/src/auth/session-payload.ts
packages/db/src/review-runs/review-run.ts
packages/webhook-auth/src/verify-webhook-signature.ts
packages/github-client/src/get-installation-token.ts
```

Package exports

```json
{
  "name": "@repo/contracts",
  "exports": {
    "./review-runs/create-review-run": "./src/review-runs/create-review-run.ts",
    "./review-runs/review-run": "./src/review-runs/review-run.ts"
  }
}
```

Example implements: [Monorepo Package Boundaries](./monorepo-package-boundaries.md), [No Re-exports](./no-re-exports.md), [No Premature Abstractions](../abstractions/no-premature-abstractions.md).
