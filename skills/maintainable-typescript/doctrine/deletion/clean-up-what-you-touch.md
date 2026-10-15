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

**Rule:** Fix dead imports, unused variables, outdated comments, and inconsistent formatting in files you edit, in the same PR.

See also: [Maintainability Equals Correctness](../foundations/maintainability-equals-correctness.md), [Delete Obsolete Code](./delete-obsolete-code.md), [No Re-exports](../packages/no-re-exports.md), and [Use Branded Scalar Types](../../stack/use-branded-scalar-types.md).

## Why agents get this wrong

Focusing only on the requested feature leaves unused imports, commented-out code, and stale names beside the change. Each later edit inherits that clutter.

## What to do instead

Address lint findings and obvious review issues in the files you edit.

Keep cleanup local; avoid unrelated file-wide refactors:

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
} from '@repo/contracts/review-runs/review-run';
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

Example implements: [Clean Up What You Touch](./clean-up-what-you-touch.md), [Maintainability Equals Correctness](../foundations/maintainability-equals-correctness.md), [Use Branded Scalar Types](../../stack/use-branded-scalar-types.md).
