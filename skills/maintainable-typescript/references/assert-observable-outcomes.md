---
example:
  primary: assert-observable-outcomes
  format: code
  implements:
    - assert-observable-outcomes
    - integration-first-testing
---
# Assert Observable Outcomes

**Rule:** Durable tests should assert outcomes visible at the product boundary: rendered output, HTTP behavior, persisted state, projections, and published artifacts.

See also: [Integration-First Testing](integration-first-testing.md).

## Why agents get this wrong

Agents often assert the easiest thing to inspect:

- helper call counts
- mock invocation order
- which internal method ran first

Those assertions lock tests to implementation choreography. The code can be behaviorally correct and still fail the test after a harmless refactor.

## What to do instead

Ask what the user, caller, or downstream system can actually observe.

Prefer assertions on:

- rendered text and visible UI states
- HTTP status codes and response shapes
- persisted records or projections
- emitted artifacts or support outputs

Avoid assertions on:

- private helper calls
- internal sequencing
- exact generated prose unless the wording is itself the product contract

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

Example implements: [Assert Observable Outcomes](assert-observable-outcomes.md), [Integration-First Testing](integration-first-testing.md).
