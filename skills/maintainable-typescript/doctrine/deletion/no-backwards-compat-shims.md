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

See also: [Atomic Changes](../foundations/atomic-changes.md) and [Delete Obsolete Code](./delete-obsolete-code.md).

## Why agents get this wrong

Overloads, defaults, and wrappers can keep obsolete internal calls working after an interface changes. When the repo owns every caller, those shims defer the migration and leave two interfaces to maintain.

## What to do instead

Change the interface and update every caller in the same PR, even when that requires editing many files.

Keep a migration adapter, dual-write helper, or branch-by-abstraction layer only while both paths are live. At cutover, retain it only if it still owns a vendor or protocol boundary, supports multiple implementations, or enforces required application policy.

Otherwise, delete it in the change that completes the cutover.

## Example

Delete this forwarding wrapper and update callers to import `insertUser` from its owner:

```typescript
import type { CreateUserInput } from '@repo/contracts/users/user';
import { insertUser } from '@repo/db/users/insert-user';

export async function createUser(input: CreateUserInput) {
  return await insertUser(input);
}
```

Example implements: [No Backwards Compatibility Shims](./no-backwards-compat-shims.md), [Delete Obsolete Code](./delete-obsolete-code.md), [Use Canonical Named Types, Not Inline Object Shapes](../../stack/use-canonical-named-types.md).

## When this doesn't apply

Published npm packages with external consumers need deprecation cycles and backwards compatibility. This rule applies to internal code where the repo controls every call site.
