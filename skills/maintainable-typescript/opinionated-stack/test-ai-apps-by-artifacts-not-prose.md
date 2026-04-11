---
example:
  primary: test-ai-apps-by-artifacts-not-prose
  format: code
  implements:
    - test-ai-apps-by-artifacts-not-prose
    - assert-observable-outcomes
---
# Test AI Apps by Artifacts, Not Prose

**Rule:** In durable tests for AI applications, assert milestones, status transitions, and published artifacts. Do not pin the test to exact generated prose unless the wording is itself the contract.

See also: [Assert Observable Outcomes](../references/assert-observable-outcomes.md).

## Why agents get this wrong

Agents overfit tests to model output because the text is easy to compare.

That makes the test brittle even when the product behavior is correct. Small wording changes, model upgrades, or harmless prompt edits can break the test without breaking the user-facing outcome.

## What to do instead

Assert on stable outcomes such as:

- run started
- run completed
- expected status visible in UI
- support PR or artifact exists
- error state is surfaced correctly

Only assert on exact text when the exact text is itself the feature.

## Example

Wrong:

```typescript
expect(result.summary).toBe("I opened PR #42 and fixed the bug.");
```

Better:

```typescript
expect(run.status).toBe("completed");
expect(screen.getByText("Status: completed")).toBeVisible();
expect(screen.getByRole("link", { name: /Support PR #/ })).toBeVisible();
```

Example implements: [Test AI Apps by Artifacts, Not Prose](test-ai-apps-by-artifacts-not-prose.md), [Assert Observable Outcomes](../references/assert-observable-outcomes.md).
