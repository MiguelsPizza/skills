---
example:
  primary: commit-messages-describe-why
  format: text
  implements:
    - commit-messages-describe-why
    - atomic-changes
    - maintainability-equals-correctness
---
# Commit Messages Describe Why

**Rule:** Explain why the change exists. Keep one logical change per commit. Never commit generated files, build artifacts, or secrets.

See also: [Atomic Changes](./atomic-changes.md).

## Why agents get this wrong

Messages such as `update user.ts` repeat the diff without explaining the decision. Commits that bundle unrelated changes make bisecting and reverting harder.

## What to do instead

Use this format:

```text
<type>: <why this change exists>

<optional body explaining context, tradeoffs, or what was considered>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `build`, `chore`

Separate unrelated changes into separate commits. A message that joins distinct purposes with "and" usually needs splitting.

## Example

```text
fix: reject duplicate review runs before insert to preserve the installation-plus-pr invariant
refactor: move webhook signature verification into webhook-auth so the boundary owns it
test: cover review-run creation through the HTTP boundary instead of mocked services
```

Example implements: [Commit Messages Describe Why](./commit-messages-describe-why.md), [Atomic Changes](./atomic-changes.md), [Maintainability Equals Correctness](./maintainability-equals-correctness.md).
