---
example:
  primary: use-branded-scalar-types
  format: code
  implements:
    - use-branded-scalar-types
    - ssot-or-die
    - use-canonical-named-types
---
# Use Branded Scalar Types

**Rule:** When two domain values share the same runtime primitive but are not interchangeable, define branded scalar types at the schema boundary and use those names everywhere else.

See also: [SSOT or Die](../references/ssot-or-die.md), [Use Canonical Named Types, Not Inline Object Shapes](use-canonical-named-types.md), and [Errors Are Schema, Not Strings](errors-are-schema.md).

## Why agents get this wrong

Agents see `string` and treat every domain identifier as interchangeable. That is how you end up with `reviewRunId: string`, `installationId: string`, and `userId: string` flowing through the same code with no signal about which value belongs where.

That makes examples deceptively simple and production code easy to misuse. A repo that preaches canonical types should not teach anonymous primitives for domain-critical IDs.

## What to do instead

Define branded scalar schemas once, infer their types, and import those named types everywhere else.

For the house stack, brand at the Zod boundary so runtime validation and compile-time meaning come from the same source.

```typescript
import { z } from 'zod';

export const reviewRunIdSchema = z.string().min(1).brand<'ReviewRunId'>();
export type ReviewRunId = z.infer<typeof reviewRunIdSchema>;

export const installationIdSchema = z.string().min(1).brand<'InstallationId'>();
export type InstallationId = z.infer<typeof installationIdSchema>;
```

Use branded scalars for IDs, slugs, codes, and other primitives where accidental interchange would be a bug. Do not brand every number and string in the system just because you can.

## Example

Review run owner

```typescript
import { z } from 'zod';

export const reviewRunIdSchema = z.string().min(1).brand<'ReviewRunId'>();
export type ReviewRunId = z.infer<typeof reviewRunIdSchema>;
```

Installation owner

```typescript
import { z } from 'zod';

export const installationIdSchema = z.string().min(1).brand<'InstallationId'>();
export type InstallationId = z.infer<typeof installationIdSchema>;
```

Procedure contract

```typescript
import { z } from 'zod';
import { installationIdSchema } from '@repo/contracts/installations/installation';
import { reviewRunIdSchema } from '@repo/contracts/review-runs/review-run';

export const completeReviewRunInputSchema = z.object({
  reviewRunId: reviewRunIdSchema,
  installationId: installationIdSchema,
});
export type CompleteReviewRunInput = z.infer<typeof completeReviewRunInputSchema>;
```

Feature usage

```typescript
import type { CompleteReviewRunInput } from '@repo/contracts/review-runs/complete-review-run';

export async function completeReviewRun(input: CompleteReviewRunInput) {
  const reviewRun = await getReviewRun(input.reviewRunId);
  await markReviewRunComplete(reviewRun.id, input.installationId);
}
```

Example implements: [Use Branded Scalar Types](use-branded-scalar-types.md), [SSOT or Die](../references/ssot-or-die.md), [Use Canonical Named Types, Not Inline Object Shapes](use-canonical-named-types.md).
