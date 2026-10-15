---
example:
  primary: test-ai-apps-by-artifacts-not-prose
  format: code
  implements:
    - test-ai-apps-by-artifacts-not-prose
    - assert-observable-outcomes
    - integration-first-testing
---
# Test AI Apps by Artifacts, Not Prose

**Rule:** Test AI applications through milestones, status transitions, and published artifacts; assert exact generated prose only when wording is the contract.

See also: [Assert Observable Outcomes](./assert-observable-outcomes.md).

## Why agents get this wrong

Exact-text assertions fail after model upgrades or prompt edits that leave product behavior unchanged.

## What to do instead

Assert that runs start and complete, the UI shows the expected status, artifacts or support outputs exist, and errors are visible to the user.

Compare exact text only when the wording itself is the feature.

## Example

Wrong:

```typescript
expect(result.summary).toBe("I opened PR #42 and fixed the bug.");
```

Better:

```typescript
expect(run.status).toBe("completed");
expect(screen.getByText("Status: completed")).toBeVisible();
expect(screen.getByRole("link", { name: /Support output/ })).toBeVisible();
```

Example implements: [Test AI Apps by Artifacts, Not Prose](./test-ai-apps-by-artifacts-not-prose.md), [Assert Observable Outcomes](./assert-observable-outcomes.md), [Integration-First Testing](./integration-first-testing.md).
