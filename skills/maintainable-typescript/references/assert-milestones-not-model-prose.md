---
example:
  primary: assert-milestones-not-model-prose
  format: code
  implements:
    - assert-milestones-not-model-prose
    - integration-first-testing
    - bounded-behavior
---
# Assert Milestones, Not Model Prose

**Rule:** For tests that cross an LLM or agent boundary, assert durable artifacts and state transitions — run statuses, PRs, check runs, persisted records, rendered status labels. Never assert exact model output text in a durable test.

See also: [Integration-First Testing](integration-first-testing.md) and [Bounded Behavior](bounded-behavior.md).

## Why agents get this wrong

Agents assert against substrings of model output: `expect(reply).toContain('pull request')`, `expect(summary).toMatch(/approved/i)`. These pass the first time the model produces the expected phrasing, then flake once a new sampling seed, a revised prompt, or a new model revision generates equivalent text that happens not to match. The fix pattern becomes a creeping regex, and the test ends up testing the tokenizer instead of the product.

## What to do instead

Assert at the milestones the system controls deterministically:

- run status transitions (`queued` -> `in_progress` -> `completed`)
- presence of an externally visible artifact (PR number, check run ID, uploaded file)
- persisted rows with a known shape
- UI elements with stable roles and labels, e.g. `getByRole('link', { name: /Support PR #/ })`

Those milestones are produced by your app code, not by the model, so they survive model drift.

If a test genuinely needs to inspect model output — for example, a contract-style eval — put it in a separate eval lane that runs at a lower cadence with explicit tolerance for variance. Do not mix evals into durable integration or e2e lanes.

## Example

Bad — asserting model prose:

```typescript
const { summary } = await agent.runReview(pull);
expect(summary).toContain('looks good');
```

Good — asserting milestones the app produces:

```typescript
await page.getByRole('button', { name: 'Run WebMCP maintainer' }).click();
await expect(page.getByText('Status: in progress')).toBeVisible();

// webhook delivers check_suite completion ...

await expect(page.getByText('Status: completed')).toBeVisible({ timeout: 120_000 });
await expect(page.getByRole('link', { name: /Support PR #/ })).toBeVisible();

const run = await getRun(runId);
expect(run.status).toBe('completed');
expect(run.supportPrNumber).toBeGreaterThan(0);
```

Example implements: [Assert Milestones, Not Model Prose](assert-milestones-not-model-prose.md), [Integration-First Testing](integration-first-testing.md), [Bounded Behavior](bounded-behavior.md).
