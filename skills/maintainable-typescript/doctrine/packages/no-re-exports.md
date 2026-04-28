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

**Rule:** Do not export a symbol from a file that does not own it. No forwarding exports, no alias exports, no compatibility re-exports.

See also: [Delete Obsolete Code](../deletion/delete-obsolete-code.md), [No Backwards Compatibility Shims](../deletion/no-backwards-compat-shims.md), and [Monorepo Package Boundaries](./monorepo-package-boundaries.md).

## Why agents get this wrong

Agents like "clean" API surfaces, so they add forwarding modules and alias exports to avoid touching imports. That creates fake ownership. Now the symbol appears to live in two places, and every rename or move leaves another compatibility path behind.

In internal monorepos this is usually needless. You control the code. Search for imports, update them, and delete the old path.

## What to do instead

Import from the owning module directly.

That path is a statement of ownership, not a promise that the owner will never split. If the owning module becomes too broad, rename imports to the new leaves in the same change instead of adding forwarding exports.

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

Package manifest

```json
{
  "name": "@repo/contracts",
  "exports": {
    "./users/user": "./src/users/user.ts"
  }
}
```

Feature module

```typescript
import type { User } from '@repo/contracts/users/user';
import { fetchUserById } from '@repo/db/users/fetch-user-by-id';
```

Example implements: [No Re-exports](./no-re-exports.md), [Delete Obsolete Code](../deletion/delete-obsolete-code.md), [No Backwards Compatibility Shims](../deletion/no-backwards-compat-shims.md).
