---
example:
  primary: no-unused-exports
  format: code
  implements:
    - no-unused-exports
    - delete-obsolete-code
    - no-re-exports
---
# No Unused Exports

**Rule:** If a function was renamed, don't add `export { newName as oldName }`. If a type moved packages, don't re-export from the old location. Find all consumers, update them, remove the old path. One PR, clean break.

See also: [No Re-exports](no-re-exports.md).

## Why agents get this wrong

Agents worry about breaking imports they can't see. So they leave stale aliases and compatibility paths "just in case" something somewhere still imports from the old name or location. In a private codebase, this is almost never necessary — you can search for all usages.

## What to do instead

1. Search the codebase for all imports of the old name/path
2. Update them to the new name/path
3. Remove the old export entirely
4. If you genuinely can't find all consumers, fix the ones you can and let the build tell you about the rest

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
import type { UserId } from '@repo/shared-types/user-id';
import { db } from '@repo/db/client';
import { users } from '@repo/db/schema/users';

export async function fetchUserById(userId: UserId) {
  return await db.query.users.findFirstOrThrow({
    where: eq(users.id, userId),
  });
}
```

Example implements: [No Unused Exports](no-unused-exports.md), [Delete Obsolete Code](delete-obsolete-code.md), [No Re-exports](no-re-exports.md).
