---
example:
  primary: no-re-exports
  format: code
  implements:
    - no-re-exports
    - no-unused-exports
    - no-backwards-compat-shims
---
# No Re-exports

**Rule:** Do not export a symbol from a file that does not own it. No forwarding exports, no alias exports, no compatibility re-exports.

See also: [No Unused Exports](no-unused-exports.md), [No Backwards Compatibility Shims](no-backwards-compat-shims.md), and [Monorepo Package Boundaries](monorepo-package-boundaries.md).

## Why agents get this wrong

Agents like "clean" API surfaces, so they add forwarding modules and alias exports to avoid touching imports. That creates fake ownership. Now the symbol appears to live in two places, and every rename or move leaves another compatibility path behind.

In internal monorepos this is usually needless. You control the code. Search for imports, update them, and delete the old path.

## What to do instead

Import from the owning module directly.

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

1. Find every consumer
2. Update every import
3. Delete the old export path in the same PR

Published external packages may choose a deprecation path. Internal packages should not.

## Example

Package manifest

```json
{
  "name": "@repo/shared-types",
  "exports": {
    "./users/user": "./src/users/user.ts"
  }
}
```

Feature module

```typescript
import type { User } from '@repo/shared-types/users/user';
import { fetchUserById } from '@repo/db/users/fetch-user-by-id';
```

Example implements: [No Re-exports](no-re-exports.md), [No Unused Exports](no-unused-exports.md), [No Backwards Compatibility Shims](no-backwards-compat-shims.md).
