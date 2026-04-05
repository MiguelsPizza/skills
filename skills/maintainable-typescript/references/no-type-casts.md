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

See also: [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md) and [SSOT or Die](ssot-or-die.md).

## Why agents get this wrong

When an agent hits a type error, the fastest fix is `as SomeType`. The code compiles, the test passes, and the agent moves on. But the type error was a signal — something about the contract is wrong. The cast silences the signal without fixing the problem, and every future agent that reads the code inherits the cast as a "pattern."

## What to do instead

When you hit a type error:

1. Identify the real boundary that is incorrectly typed
2. Fix the type definition at the source
3. If you can't fix the source (third-party), use a type guard with runtime narrowing
4. If none of the above work, add a `// @ts-expect-error` with a reason — never a silent cast

Do not cast globals to reach your own properties. Declare the global type properly.

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

Example implements: [No Type Casts](no-type-casts.md), [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md), [SSOT or Die](ssot-or-die.md).
