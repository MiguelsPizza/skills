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

Agents like "clean" API surfaces, so they add forwarding modules and alias exports to avoid touching imports. That creates fake ownership. Now the symbol appears to live in two places, and every rename or move leaves another compatibility path behind.

In internal monorepos this is usually needless. You control the code. Search for imports, update them, and delete the old path.

## What to do instead

Import from the owning module directly.

That path is a statement of ownership, not a promise that the owner will never split. If the owning module becomes too broad, rename imports to the new leaves in the same change instead of adding forwarding exports.

Importing a binding first does not make it locally owned. `import { User } ...; export { User }` and `export default importedUser` are forwarding exports too. Aliases do not change that ownership.

Enforce this with `maintainable/no-re-exports` from the [Oxlint Maintainability skill](https://github.com/MiguelsPizza/skills/tree/main/skills/oxlint-maintainability).

The filename does not decide ownership. An `index.ts` that defines its own schema, type, function, or constant is valid. Check what the file exports, not whether its filename looks like a barrel.

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

If nothing imports an internal export anymore, remove the export. Unused exports are not harmless API surface; they are stale ownership claims.

Published external packages may choose a deprecation path. Internal packages should not.

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
