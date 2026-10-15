---
example:
  primary: no-defensive-null-checks
  format: code
  implements:
    - no-defensive-null-checks
    - use-canonical-named-types
    - ssot-or-die
---
# No Defensive Null Checks

**Rule:** Trust non-nullable types. Fix an incorrect type at its source instead of guarding a value declared non-nullable.

See also: [No Type Casts](./no-type-casts.md) and [Use Branded Scalar Types](../../stack/use-branded-scalar-types.md).

## Why agents get this wrong

Agents guard values that TypeScript guarantees are present. Later code copies the guards, making non-nullable fields appear unreliable.

## What to do instead

Use `strict: true` and declare nullable values as nullable. Check them where their absence matters. If runtime data contradicts a non-nullable type, correct the contract or boundary validation.

## Example

Truthful type

```typescript
import type { User } from '@repo/contracts/users/user';

function formatUser(user: User): string {
  return `${user.displayName} <${user.email}>`;
}
```

Nullable type

```typescript
import type { PendingInvite } from '@repo/contracts/invites/pending-invite';

function formatInvite(invite: PendingInvite): string {
  return `${invite.displayName ?? invite.email} <${invite.email}>`;
}
```

Example implements: [No Defensive Null Checks](./no-defensive-null-checks.md), [Use Canonical Named Types, Not Inline Object Shapes](../../stack/use-canonical-named-types.md), [SSOT or Die](../abstractions/ssot-or-die.md).
