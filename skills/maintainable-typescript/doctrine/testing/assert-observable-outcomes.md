---
example:
  primary: assert-observable-outcomes
  format: code
  implements:
    - assert-observable-outcomes
    - integration-first-testing
    - bounded-behavior
---
# Assert Observable Outcomes

**Rule:** Durable tests must assert outcomes visible to users, callers, or downstream systems.

See also: [Integration-First Testing](./integration-first-testing.md).

## Why agents get this wrong

Assertions on helper calls and internal sequencing break after harmless refactors, even when behavior is unchanged.

## What to do instead

Assert on rendered output, HTTP status and response shapes, persisted records, projections, and published artifacts.

Avoid private helper calls and internal sequencing. Assert exact generated prose only when the wording is part of the product contract.

## Example

Wrong:

```typescript
expect(sendCheckRunUpdate).toHaveBeenCalledTimes(1);
expect(buildSummary).toHaveBeenCalledBefore(writeArtifact);
```

Better:

```typescript
expect(response.status).toBe(202);
expect(runProjection.status).toBe("completed");
expect(screen.getByText("Status: completed")).toBeVisible();
```

Example implements: [Assert Observable Outcomes](./assert-observable-outcomes.md), [Integration-First Testing](./integration-first-testing.md), [Bounded Behavior](../foundations/bounded-behavior.md).
