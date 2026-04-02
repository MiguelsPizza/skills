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

**Rule:** Packages are single-purpose, well-tested units with explicit public entrypoints. Dependencies flow one direction: packages never import from apps, shared packages never import from domain packages. When in doubt, keep it in the app — extract to a package only when a second consumer appears.

See also: [No Premature Abstractions](no-premature-abstractions.md), [One Concept Per File](one-concept-per-file.md), and [No Barrel Exports](no-barrel-exports.md).

## Why agents get this wrong

Agents create packages eagerly. They see shared logic and immediately extract it into a new package, even when only one app uses it. They also violate dependency direction — importing from apps into packages, creating circular references, or importing from the wrong layer.

## What to do instead

Keep code in the app until there is a second real consumer. When extraction is justified, make the package single-purpose, expose leaf modules through `package.json` subpath exports, and keep dependency flow one-way.

Use this boundary model:

```
packages/shared-types/
packages/db/
apps/web/
apps/api/
```

Create a package when:
- Two or more apps need the same code
- The code has a clear, testable contract
- The public entrypoints can be explicit

Do not create a package when:
- Only one app uses it — keep it as a directory in that app
- It's "shared" utilities with no coherent domain — don't create `packages/utils`
- You're creating it speculatively for "future" consumers

## Example

Directory layout

```text
apps/web/src/features/review-runs/create-review-run-form.tsx
apps/api/src/routes/review-runs.ts
apps/api/src/features/review-runs/create-review-run.ts
packages/shared-types/src/review-runs/create-review-run.ts
packages/db/src/review-runs/review-run.ts
packages/webhook-auth/src/verify-webhook-signature.ts
packages/github-client/src/get-installation-token.ts
```

Package exports

```json
{
  "name": "@repo/shared-types",
  "exports": {
    "./review-runs/create-review-run": "./src/review-runs/create-review-run.ts",
    "./review-runs/review-run": "./src/review-runs/review-run.ts"
  }
}
```

Example implements: [Monorepo Package Boundaries](monorepo-package-boundaries.md), [No Barrel Exports](no-barrel-exports.md), [No Premature Abstractions](no-premature-abstractions.md).
