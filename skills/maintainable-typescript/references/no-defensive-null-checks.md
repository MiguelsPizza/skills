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

**Rule:** If the type says it's not null, trust the type. If the type is wrong, fix the type. Don't add runtime null checks for values that can't be null.

See also: [No Type Casts](no-type-casts.md) and [Use Branded Scalar Types](../opinionated-stack/use-branded-scalar-types.md).

## Why agents get this wrong

Agents add `if (x != null)` guards everywhere, even for values that TypeScript guarantees are present. They treat the type system as unreliable and add a runtime safety net on top. This is defensive programming against your own code — it communicates distrust and propagates to every future agent that reads the pattern.

## What to do instead

Trust the type system. That's why you have `strict: true`. If a value genuinely could be null, the type should reflect that — and then the null check is appropriate. If the type says non-null but you're worried it might be null at runtime, the fix is to correct the type, not to add a guard.

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

Example implements: [No Defensive Null Checks](no-defensive-null-checks.md), [Use Canonical Named Types, Not Inline Object Shapes](../opinionated-stack/use-canonical-named-types.md), [SSOT or Die](ssot-or-die.md).
## The propagation problem

When an agent sees `user.name ?? 'Unknown'` on a non-nullable field, it concludes "name might be null" and adds the same guard in every new function it writes. One unnecessary null check becomes ten. The codebase now implicitly documents that `User.name` is unreliable, even though the type says otherwise.
