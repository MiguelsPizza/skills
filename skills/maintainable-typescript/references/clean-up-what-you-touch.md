---
example:
  primary: clean-up-what-you-touch
  format: code
  implements:
    - clean-up-what-you-touch
    - maintainability-equals-correctness
    - use-branded-scalar-types
---
# Clean Up What You Touch

**Rule:** If you're editing a file and notice dead imports, unused variables, outdated comments, or inconsistent formatting — fix them. Not in a separate PR. Right now.

See also: [Maintainability Equals Correctness](maintainability-equals-correctness.md), [Delete Obsolete Code](delete-obsolete-code.md), [No Unused Exports](no-unused-exports.md), and [Use Branded Scalar Types](../opinionated-stack/use-branded-scalar-types.md).

## Why agents get this wrong

Agents scope their changes narrowly to minimize risk. They'll add a new function to a file and ignore the three unused imports at the top, the commented-out block from six months ago, and the variable that was renamed everywhere except line 47. They treat cleanup as a separate concern from feature work.

## What to do instead

Every file you touch should be better when you leave it than when you found it. This isn't a separate task — it's part of the change. If the linter would flag it, fix it. If a human reviewer would comment on it, fix it.

This doesn't mean refactor entire files you're passing through. It means:
- Remove unused imports you see
- Delete commented-out code
- Fix obvious typos in nearby comments
- Update stale variable names in code you're already modifying
- Remove dead branches in conditionals you're editing

## Example

```typescript
import {
  REVIEW_RUN_STATUS,
  type ReviewRunId,
} from '@repo/shared-types/review-runs/review-run';
import { getReviewRun } from '@repo/db/review-runs/get-review-run';
import { updateReviewRun } from '@repo/db/review-runs/update-review-run';

export async function archiveReviewRun(reviewRunId: ReviewRunId) {
  const reviewRun = await getReviewRun(reviewRunId);
  if (!reviewRun) return;

  return updateReviewRun(reviewRunId, {
    status: REVIEW_RUN_STATUS.ARCHIVED,
  });
}
```

Example implements: [Clean Up What You Touch](clean-up-what-you-touch.md), [Maintainability Equals Correctness](maintainability-equals-correctness.md), [Use Branded Scalar Types](../opinionated-stack/use-branded-scalar-types.md).
