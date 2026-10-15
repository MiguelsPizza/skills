---
example:
  primary: maintainability-equals-correctness
  format: code
  implements:
    - maintainability-equals-correctness
    - use-branded-scalar-types
    - no-magic-values
---
# Maintainability Equals Correctness

**Rule:** A change is complete when it works and remains maintainable. Leave every file better than you found it.

See also: [Clean Up What You Touch](../deletion/clean-up-what-you-touch.md), [SSOT or Die](../abstractions/ssot-or-die.md), [Your Pattern Will Be Copied](./your-pattern-will-be-copied.md), and [Use Branded Scalar Types](../../stack/use-branded-scalar-types.md).

## Why agents get this wrong

Passing the current test or adding the requested endpoint can hide duplication, tangled control flow, and unclear ownership. Those costs carry into every later change.

## What to do instead

Before finishing:

- Make the change understandable from the diff.
- Reuse existing concepts instead of duplicating them.
- Use patterns worth repeating in future changes.
- Fix any file the change made worse.

## Example

```typescript
import { completeReviewRunInputSchema } from '@repo/contracts/review-runs/complete-review-run';
import { REVIEW_RUN_STATUS } from '@repo/contracts/review-runs/review-run';
import { getReviewRun } from '@repo/db/review-runs/get-review-run';
import { updateReviewRunStatus } from '@repo/db/review-runs/update-review-run-status';
import { publicProcedure } from '../orpc';
import { emitReviewRunStatusChange } from '@/features/review-runs/emit-review-run-status-change';

export const completeReviewRun = publicProcedure
  .input(completeReviewRunInputSchema)
  .handler(async ({ input, errors }) => {
    const reviewRun = await getReviewRun(input.reviewRunId);
    if (!reviewRun) {
      throw errors.NOT_FOUND({
        data: {
          code: 'review_run_not_found',
          message: 'Review run does not exist.',
          reviewRunId: input.reviewRunId,
        },
      });
    }

    await updateReviewRunStatus(input.reviewRunId, REVIEW_RUN_STATUS.COMPLETED);
    await emitReviewRunStatusChange(input.reviewRunId, REVIEW_RUN_STATUS.COMPLETED);
  });
```

Example implements: [Maintainability Equals Correctness](./maintainability-equals-correctness.md), [Use Branded Scalar Types](../../stack/use-branded-scalar-types.md), [No Magic Values](../../stack/no-magic-values.md).
