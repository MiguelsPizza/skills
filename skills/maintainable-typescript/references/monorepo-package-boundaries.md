---
example:
  primary: monorepo-package-boundaries
  format: code
  implements:
    - monorepo-package-boundaries
    - no-barrel-exports
    - no-premature-abstractions
---
# Monorepo Package Boundaries

**Rule:** Packages are single-purpose, well-tested units with explicit public entrypoints. Dependencies flow one direction: packages never import from apps, shared packages never import from domain packages. Keep runtime behavior in the app by default, but respect established package ownership for canonical contracts and schemas.

See also: [No Premature Abstractions](no-premature-abstractions.md), [Split By Stable Seam](split-by-stable-seam.md), and [No Barrel Exports](no-barrel-exports.md).

## Why agents get this wrong

Agents create packages eagerly. They see shared logic and immediately extract it into a new package, even when only one app uses it. They also violate dependency direction — importing from apps into packages, creating circular references, or importing from the wrong layer.

## What to do instead

Keep runtime code in the app until there is a second real consumer. When extraction is justified, make the package single-purpose, expose leaf modules through `package.json` subpath exports, and keep dependency flow one-way.

Do not confuse runtime ownership with canonical contract ownership. If the repo already centralizes source-of-truth schemas or shared Zod contracts in packages, preserve that convention even when only one app currently uses the feature. Let apps own route handlers, session behavior, and local orchestration. Let the established package own the canonical schema.

Import style should reinforce those boundaries:
- use package imports across package boundaries, never relative filesystem hops between packages
- use app-local aliases such as `@/` for nonlocal imports inside an app
- keep relative imports for genuinely local neighbors inside the same area

Those leaf modules are ownership signals, not excuses for giant domain files. Export `./review-runs/review-run` while that file still owns one review-run concept; if the module grows multiple responsibilities, split the module and expose the new owning leaves instead.

In practice, directories usually carry the higher-level feature or domain boundary. Files inside them should represent the stable seams within that feature: routes, contracts, persistence, client wrappers, or session/cookie subsystems.

Use this boundary model:

```
packages/contracts/
packages/db/
apps/web/
apps/api/
```

Create a package when:
- Two or more apps need the same code
- The code has a clear, testable contract
- The public entrypoints can be explicit
- The repo convention says this package owns canonical contracts for that kind of data

Do not create a package when:
- Only one app uses it — keep it as a directory in that app
- It's "shared" utilities with no coherent domain — don't create `packages/utils`
- You're creating it speculatively for "future" consumers
- You are moving runtime behavior out of the app just to colocate it with a schema

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

Example implements: [Monorepo Package Boundaries](monorepo-package-boundaries.md), [No Barrel Exports](no-barrel-exports.md), [No Premature Abstractions](no-premature-abstractions.md).
