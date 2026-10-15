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

**Rule:** Complete one logical change in one PR, including every affected caller.

See also: [No Backwards Compatibility Shims](../deletion/no-backwards-compat-shims.md) and [Delete Obsolete Code](../deletion/delete-obsolete-code.md).

## Why agents get this wrong

Splitting a rename from its caller updates leaves broken references. Adding a replacement and deferring deletion leaves two active versions. Each PR must leave the codebase consistent.

## What to do instead

Include all parts of a logical change, even a mechanical rename across 15 files. This keeps the codebase consistent, lets CI validate the complete change, and makes bisecting and reverting reliable.

## When to split

Split only when each PR can merge on its own and leave the codebase correct. An interface refactor can precede a feature that uses it. A bug fix and its regression tests belong together.

## Example

```text
PR: rename createReviewRun() to createReviewRequest()

- rename the owning module and exported symbol
- update every import across the API app and worker packages
- delete the old export path in the same change
- remove tests and docs that reference the old name
- merge only when CI passes on the fully migrated codebase
```

Example implements: [Atomic Changes](./atomic-changes.md), [No Backwards Compatibility Shims](../deletion/no-backwards-compat-shims.md), [Delete Obsolete Code](../deletion/delete-obsolete-code.md).
