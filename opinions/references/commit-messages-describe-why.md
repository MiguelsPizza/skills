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

**Rule:** Commit messages explain why a change was made, not what changed. The diff shows what changed. One logical change per commit. Never commit generated files, build artifacts, or secrets.

See also: [Atomic Changes](atomic-changes.md).

## Why agents get this wrong

Agents write commit messages like `update user.ts` or `fix bug in handler` or `add new function`. These describe what happened at the file level — information that's already in the diff. They also batch unrelated changes into one commit ("update various files") making `git bisect` and `git revert` useless.

## What to do instead

Use this format:

```text
<type>: <why this change exists>

<optional body explaining context, tradeoffs, or what was considered>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `build`, `chore`

Never batch unrelated work under one message. If one commit needs "and", it probably needs to be two commits.

## Example

```text
fix: reject duplicate review runs before insert to preserve the installation-plus-pr invariant
refactor: move webhook signature verification into webhook-auth so the boundary owns it
test: cover review-run creation through the HTTP boundary instead of mocked services
```

Example implements: [Commit Messages Describe Why](commit-messages-describe-why.md), [Atomic Changes](atomic-changes.md), [Maintainability Equals Correctness](maintainability-equals-correctness.md).
