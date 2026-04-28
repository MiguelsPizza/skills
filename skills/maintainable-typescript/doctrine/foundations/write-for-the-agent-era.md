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

**Rule:** Optimize for review, deletion, and safe replacement under high churn. Code is cheap now. Structure is expensive.

See also: [Maintainability Equals Correctness](./maintainability-equals-correctness.md), [Your Pattern Will Be Copied](./your-pattern-will-be-copied.md), and [Delete Fake Layers](../deletion/delete-fake-layers.md).

## Why agents get this wrong

Older clean-code instincts were formed when writing code was expensive. Agents invert that cost. They can generate huge amounts of code quickly, so the main risk is no longer underproduction. The risk is preserving stale structure, adding low-value layers, and making a long series of "safe" local edits that leave the module harder to understand than a rewrite would have.

## What to do instead

Preserve contracts, tests, and invariants. Do not preserve obsolete decomposition.

When a file has churned enough that its names, control flow, or data model no longer match the real job, rewrite the internals in one pass. Small diffs are not a design goal. Truthful code is.

In agent-heavy repos, optimize for:
- scanability under heavy change
- fewer concepts, not fewer lines
- deleting dead structure early
- rewriting churned modules behind stable contracts
- patterns you would want copied 100 times

## Example

```text
Bad: keep the old phase-based file, add more flags, wrappers, and adapter types, and preserve the old call graph because changing it feels risky.

Good: keep the exported contract and tests, rewrite the file so the current workflow is direct, rename it around the real job, and delete the old helper layers.
```

Example implements: [Write for the Agent Era](./write-for-the-agent-era.md), [Maintainability Equals Correctness](./maintainability-equals-correctness.md), [Your Pattern Will Be Copied](./your-pattern-will-be-copied.md).
## The test

If writing the file fresh to today's requirements would produce a materially simpler design, stop preserving yesterday's structure.
