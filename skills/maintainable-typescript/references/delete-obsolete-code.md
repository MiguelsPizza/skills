---
example:
  primary: delete-obsolete-code
  format: code
  implements:
    - delete-obsolete-code
    - no-backwards-compat-shims
    - no-unused-exports
---
# Delete Obsolete Code

**Rule:** If something is replaced, remove it in the same PR. Don't deprecate it, don't comment it out, don't rename it with an underscore prefix.

## Why agents get this wrong

Agents are trained to be cautious. When they replace a function, they leave the old one "just in case" — adding a `@deprecated` tag, commenting it out, or renaming it to `_oldFunction`. This feels safe in the moment but creates a codebase full of ghost code that misleads every future reader.

## What to do instead

Delete it. In the same PR that introduces the replacement. If the old code had callers, update them all. If you're worried about losing it, that's what `git log` is for.

Dead code is worse than no code. It:
- Misleads the next agent into thinking it's load-bearing
- Shows up in searches and IDE suggestions
- Creates confusion about which version is canonical
- Accumulates until someone has to do a dedicated cleanup sprint

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

Example implements: [Delete Obsolete Code](delete-obsolete-code.md), [No Backwards Compatibility Shims](no-backwards-compat-shims.md), [No Unused Exports](no-unused-exports.md).
