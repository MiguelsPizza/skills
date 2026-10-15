---
example:
  primary: no-re-exports
  format: code
  implements:
    - no-re-exports
    - delete-obsolete-code
    - no-backwards-compat-shims
---
# No Re-exports

**Rule:** Export declarations owned by the current module. Do not forward imports through named, wildcard, namespace, type-only, or default exports.

See also: [Delete Obsolete Code](../deletion/delete-obsolete-code.md), [No Backwards Compatibility Shims](../deletion/no-backwards-compat-shims.md), and [Monorepo Package Boundaries](./monorepo-package-boundaries.md).

## Why agents get this wrong

Forwarding modules and alias exports make one declaration appear to have multiple owners. Keeping them after a move leaves stale import paths for later changes to copy.

## What to do instead

Import directly from the owning module. If it splits, update imports to the new owners in the same change.

Imported bindings remain owned by their source. `import { User } ...; export { User }` and `export default importedUser` are forwarding exports, including when aliased.

Enforce this with `maintainable/no-re-exports` from the [Oxlint Maintainability skill](https://github.com/MiguelsPizza/skills/tree/main/skills/oxlint-maintainability).

An `index.ts` may export schemas, types, functions, or constants it defines.

If a package needs stable public entrypoints, define them in `package.json` subpath exports and point each subpath at the real file:

```json
{
  "exports": {
    "./users/user": "./src/users/user.ts",
    "./review-runs/review-run": "./src/review-runs/review-run.ts"
  }
}
```

When moving or renaming:

1. Search for every import of the old name or path
2. Update every import
3. Delete the old export path in the same PR

Remove internal exports that have no remaining importers.

Use deprecation paths only for published packages with external consumers.

## Example

Bad: each export forwards a declaration owned by another module.

```typescript
export { userSchema } from './users/user';
export type { User } from './users/user';
export * from './users/user';
export * as users from './users/user';

import { userSchema as importedUserSchema } from './users/user';
export { importedUserSchema as schema };
export default importedUserSchema;
```

Good: the owner defines the schema and derives its type, even when named `index.ts`.

```typescript
// packages/contracts/src/users/index.ts
import { z } from 'zod';

export const userIdSchema = z.string().min(1).brand<'UserId'>();
export type UserId = z.infer<typeof userIdSchema>;
```

Point the public path at that owner.

```json
{
  "name": "@repo/contracts",
  "exports": {
    "./users": "./src/users/index.ts"
  }
}
```

Consumers import from the declared public path.

```typescript
import { userIdSchema, type UserId } from '@repo/contracts/users';
```

Example implements: [No Re-exports](./no-re-exports.md), [Delete Obsolete Code](../deletion/delete-obsolete-code.md), [No Backwards Compatibility Shims](../deletion/no-backwards-compat-shims.md).
