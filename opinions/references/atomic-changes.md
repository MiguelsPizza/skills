---
example:
  primary: atomic-changes
  format: text
  implements:
    - atomic-changes
    - no-backwards-compat-shims
    - delete-obsolete-code
---
# Atomic Changes

**Rule:** Don't split a single logical change across multiple PRs "for safety." If renaming a type requires updating 15 files, that's one PR with 15 files.

See also: [No Backwards Compatibility Shims](no-backwards-compat-shims.md) and [Delete Obsolete Code](delete-obsolete-code.md).

## Why agents get this wrong

Agents try to keep PRs small. They'll split a rename into "rename the type" and "update the callers" as separate PRs. Or they'll add a new function in one PR and remove the old one in a follow-up. This creates broken intermediate states — between the two PRs, both the old and new version exist, or callers reference something that was already renamed.

## What to do instead

One logical change = one PR. The PR can be large. That's fine. A 15-file rename where every change is mechanical is easier to review than two 8-file PRs where the first leaves the codebase in an inconsistent state.

Atomic changes are actually *safer* than split ones because:
- The codebase is never in a half-migrated state
- `git bisect` works correctly
- Reverting is one operation, not "revert PR 2 then revert PR 1"
- CI validates the complete change, not a broken intermediate

## When to split

Split when the changes are actually independent:
- Refactor the interface (PR 1) → Add the new feature that needs it (PR 2)
- Fix the bug (PR 1) → Add tests for the edge case (PR 2... actually, this should be one PR)

If you can't merge PR 1 without PR 2 and have a correct codebase, they're not independent.

## Example

```text
PR: rename createReviewRun() to createReviewRequest()

- rename the owning module and exported symbol
- update every import across the API app and worker packages
- delete the old export path in the same change
- remove tests and docs that reference the old name
- merge only when CI passes on the fully migrated codebase
```

Example implements: [Atomic Changes](atomic-changes.md), [No Backwards Compatibility Shims](no-backwards-compat-shims.md), [Delete Obsolete Code](delete-obsolete-code.md).
