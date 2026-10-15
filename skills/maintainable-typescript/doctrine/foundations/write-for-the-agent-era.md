---
example:
  primary: write-for-the-agent-era
  format: text
  implements:
    - write-for-the-agent-era
    - maintainability-equals-correctness
    - your-pattern-will-be-copied
---
# Write for the Agent Era

**Rule:** Organize code for review, deletion, and safe replacement under frequent change.

See also: [Maintainability Equals Correctness](./maintainability-equals-correctness.md), [Your Pattern Will Be Copied](./your-pattern-will-be-copied.md), and [Delete Fake Layers](../deletion/delete-fake-layers.md).

## Why agents get this wrong

Repeated local edits can preserve stale structure and add layers until a module becomes harder to understand than a rewrite. Rapid code generation compounds the problem.

## What to do instead

Preserve contracts, tests, and invariants. Replace obsolete internal structure.

When names, control flow, or data models no longer match the file's job, rewrite its internals in one pass.

In agent-heavy repos, optimize for:

- scanability under heavy change
- fewer concepts and files, even when that requires more lines
- colocated code that must be understood together
- deleting dead structure early
- rewriting churned modules behind stable contracts
- patterns worth repeating

## Example

```text
Bad: keep the old phase-based file, add more flags, wrappers, and adapter types, and preserve the old call graph because changing it feels risky.

Good: keep the exported contract and tests, rewrite the file so the current workflow is direct, rename it around the real job, and delete the old helper layers.
```

Example implements: [Write for the Agent Era](./write-for-the-agent-era.md), [Maintainability Equals Correctness](./maintainability-equals-correctness.md), [Your Pattern Will Be Copied](./your-pattern-will-be-copied.md).
