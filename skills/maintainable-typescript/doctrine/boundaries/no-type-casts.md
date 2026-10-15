---
example:
  primary: no-type-casts
  format: code
  implements:
    - no-type-casts
    - boundaries-validate-internals-trust
    - ssot-or-die
---
# No Type Casts

**Rule:** Do not use `as`, `as any`, or `as unknown as` to make code compile. If inference fails, fix the types at the source. Casts hide broken contracts.

See also: [Boundaries Validate, Internals Trust](./boundaries-validate-internals-trust.md) and [SSOT or Die](../abstractions/ssot-or-die.md).

## Why agents get this wrong

Agents silence type errors with `as SomeType`. The cast leaves the broken contract in place and gives later code an unsafe pattern to copy.

## What to do instead

When a type error appears:

1. Find the incorrectly typed boundary.
2. Fix its type at the source.
3. For third-party types you cannot fix, use a runtime type guard.
4. If those fail, add `// @ts-expect-error` with a reason.

Declare your global properties in the global type.

Do not bypass a type error with explicit `any` or a non-null assertion such as `user!`. Establish the contract or narrow the value where the guarantee becomes true.

## Example

```typescript
import {
  webhookPayloadSchema,
  type WebhookPayload,
} from '@repo/contracts/github/webhook-payload';

export async function loadWebhookPayload(response: Response): Promise<WebhookPayload> {
  return webhookPayloadSchema.parse(await response.json());
}
```

Example implements: [No Type Casts](./no-type-casts.md), [Boundaries Validate, Internals Trust](./boundaries-validate-internals-trust.md), [SSOT or Die](../abstractions/ssot-or-die.md).
