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

**Rule:** Code that works but is unmaintainable is not done. A PR that adds a feature but degrades the codebase is a net negative. Leave every file better than you found it.

See also: [Clean Up What You Touch](clean-up-what-you-touch.md), [SSOT or Die](ssot-or-die.md), [Your Pattern Will Be Copied](your-pattern-will-be-copied.md), and [Use Branded Scalar Types](../opinionated-stack/use-branded-scalar-types.md).

## Why agents get this wrong

Agents optimize for the immediate task: "make the test pass," "add this endpoint," "fix this bug." They don't consider whether their solution makes the next change easier or harder. Working code that's tangled, duplicated, or poorly structured creates compounding maintenance costs that dwarf the time saved by shipping fast.

## What to do instead

Before marking a task as done, ask:
- Could someone else (human or AI) understand this change from the diff alone?
- Did I introduce any new concepts that duplicate existing ones?
- Would I be comfortable if every future change in this area followed this pattern?
- Did I leave any files worse than I found them?

If the answer to any of these is no, the task isn't done.

## Example

```typescript
import { completeReviewRunInputSchema, REVIEW_RUN_STATUS } from '@repo/shared-types/review-runs/complete-review-run';
import {
  getReviewRun,
  updateReviewRunStatus,
} from '@repo/db/review-runs/review-run-repository';
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

Example implements: [Maintainability Equals Correctness](maintainability-equals-correctness.md), [Use Branded Scalar Types](../opinionated-stack/use-branded-scalar-types.md), [No Magic Values](../opinionated-stack/no-magic-values.md).
