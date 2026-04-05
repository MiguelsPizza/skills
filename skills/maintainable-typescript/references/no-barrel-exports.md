---
example:
  primary: no-barrel-exports
  format: code
  implements:
    - no-barrel-exports
    - split-by-stable-seam
    - monorepo-package-boundaries
---
# No Barrel Exports

**Rule:** Do not create aggregator modules. No `index.ts` barrels, no `export *`, no package-root files that gather siblings into one import path.

See also: [Split By Stable Seam](split-by-stable-seam.md), [Naming Is Navigation](naming-is-navigation.md), and [Monorepo Package Boundaries](monorepo-package-boundaries.md).

## Why agents get this wrong

Agents flatten module structure to reduce typing. They add `index.ts`, gather schemas, services, and types into one export surface, and call it cleaner. It is not cleaner.

Barrels hide where code lives, so humans and agents have to open more files to find ownership. They also encourage broad imports from package roots, which makes it easier to pull more runtime code into a consumer than it actually needs.

## What to do instead

Keep the owning subsystem file and let that file own its export.

The point is direct ownership, not "one forever-file per domain noun." If `review-runs/review-run.ts` stops being one concept, split it into better owning modules. Do not solve that problem with an `index.ts`.

If a package needs public entrypoints, use `package.json` subpath exports so consumers import the exact module they need:

```json
{
  "exports": {
    "./users/user": "./src/users/user.ts",
    "./review-runs/review-run": "./src/review-runs/review-run.ts",
    "./github/connect-repository": "./src/github/connect-repository.ts"
  }
}
```

This keeps navigation explicit and package surfaces tree-shakable.

## Example

Package manifest

```json
{
  "name": "@repo/contracts",
  "exports": {
    "./users/user": "./src/users/user.ts",
    "./review-runs/review-run": "./src/review-runs/review-run.ts",
    "./github/connect-repository": "./src/github/connect-repository.ts"
  }
}
```

Feature module

```typescript
import { userSchema } from '@repo/contracts/users/user';
```

Example implements: [No Barrel Exports](no-barrel-exports.md), [Split By Stable Seam](split-by-stable-seam.md), [Monorepo Package Boundaries](monorepo-package-boundaries.md).
