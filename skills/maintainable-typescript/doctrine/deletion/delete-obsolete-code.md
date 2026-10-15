---
example:
  primary: delete-obsolete-code
  format: code
  implements:
    - delete-obsolete-code
    - no-backwards-compat-shims
    - no-re-exports
---
# Delete Obsolete Code

**Rule:** Remove replaced code in the same PR, update every caller, and delete old export paths.

## Why agents get this wrong

Keeping a replaced function with `@deprecated`, a comment block, or an underscore prefix leaves it in searches and IDE suggestions. Readers must then work out which version to use.

## What to do instead

Update every caller, remove the old exports, and delete the replaced implementation. Use `git log` to recover history. Do not retain dead code through deprecation tags, comment blocks, or underscore prefixes.

## Example

Package manifest

```json
{
  "name": "@repo/db",
  "exports": {
    "./users/fetch-user-by-id": "./src/users/fetch-user-by-id.ts"
  }
}
```

Owner module

```typescript
import { eq } from 'drizzle-orm';
import type { UserId } from '@repo/contracts/users/user';
import { db } from '@repo/db/client';
import { users } from '@repo/db/schema/users';

export async function fetchUserById(userId: UserId) {
  return await db.query.users.findFirstOrThrow({
    where: eq(users.id, userId),
  });
}
```

Example implements: [Delete Obsolete Code](./delete-obsolete-code.md), [No Backwards Compatibility Shims](./no-backwards-compat-shims.md), [No Re-exports](../packages/no-re-exports.md).
