---
example:
  primary: no-backwards-compat-shims
  format: code
  implements:
    - no-backwards-compat-shims
    - delete-obsolete-code
    - use-canonical-named-types
---
# No Backwards Compatibility Shims

**Rule:** If you change an internal interface, update all callers in the same PR. Don't add overloads, default parameters, or adapter functions to keep old call sites working.

See also: [Atomic Changes](atomic-changes.md) and [Delete Obsolete Code](delete-obsolete-code.md).

## Why agents get this wrong

Agents treat every interface change as a breaking change that needs a migration path. They add function overloads, optional parameters with defaults, or thin wrapper functions so existing callers don't need to change. This is correct behavior for a published library with external consumers. It's wrong for a private codebase where you control all the callers.

## What to do instead

Change the interface. Update every caller. One PR. If that touches 20 files, so be it — that's the actual scope of the change. Hiding the migration behind a compatibility shim just defers the work and doubles the API surface in the meantime.

## Example

```typescript
import type { CreateUserInput } from '@repo/contracts/users/user';
import { insertUser } from '@repo/db/users/insert-user';

export async function createUser(input: CreateUserInput) {
  return await insertUser(input);
}
```

Example implements: [No Backwards Compatibility Shims](no-backwards-compat-shims.md), [Delete Obsolete Code](delete-obsolete-code.md), [Use Canonical Named Types, Not Inline Object Shapes](../opinionated-stack/use-canonical-named-types.md).
## When this doesn't apply

Published npm packages with external consumers do need deprecation cycles and backwards compatibility. This opinion is about internal code where you control every call site.
