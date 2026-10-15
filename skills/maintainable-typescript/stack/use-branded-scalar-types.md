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

**Rule:** Define branded scalar types at the schema boundary when domain values share a primitive but must not be interchangeable.

See also: [SSOT or Die](../doctrine/abstractions/ssot-or-die.md), [Use Canonical Named Types, Not Inline Object Shapes](./use-canonical-named-types.md), and [Errors Are Schema, Not Strings](./errors-are-schema.md).

## Why agents get this wrong

Plain `string` IDs allow unrelated values such as review run, installation, and user IDs to be passed to the same parameter.

## What to do instead

Define branded Zod schemas once, infer their types, and import those named types throughout the app. Runtime validation and type meaning then share one source.

```typescript
import { z } from 'zod';

export const reviewRunIdSchema = z.string().min(1).brand<'ReviewRunId'>();
export type ReviewRunId = z.infer<typeof reviewRunIdSchema>;

export const installationIdSchema = z.string().min(1).brand<'InstallationId'>();
export type InstallationId = z.infer<typeof installationIdSchema>;
```

Brand IDs, slugs, codes, and other primitives when accidental interchange would be a bug. Leave ordinary numbers and strings unbranded.

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

Example implements: [Use Branded Scalar Types](./use-branded-scalar-types.md), [SSOT or Die](../doctrine/abstractions/ssot-or-die.md), [Use Canonical Named Types, Not Inline Object Shapes](./use-canonical-named-types.md).
