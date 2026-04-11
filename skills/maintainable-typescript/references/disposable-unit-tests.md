---
example:
  primary: disposable-unit-tests
  format: code
  implements:
    - disposable-unit-tests
    - integration-first-testing
    - delete-obsolete-code
---
# Disposable Unit Tests

**Rule:** Unit tests are temporary TDD scaffolding. Delete them once the same behavior is exercised by a durable contract, integration, browser, or e2e test. Durable regressions live in integration-first lanes, not in long-lived unit tests.

See also: [Integration-First Testing](integration-first-testing.md) and [Delete Obsolete Code](delete-obsolete-code.md).

## Why agents get this wrong

Agents write unit tests early, while a new function is taking shape, and then never remove them. They mock siblings, assert call order, and leave the tests around as "regression coverage" even after a slice integration test already exercises the same real code path. The result is two overlapping layers where the unit layer breaks on every refactor and the integration layer is the only one that actually tells you whether the product works.

## What to do instead

Treat unit tests the way you treat a scratchpad.

1. Write them while a new function or module is taking shape, when the seam is not yet stable and iteration speed matters.
2. Land the behavior behind a durable lane — contract, slice integration, browser, or e2e.
3. In the same PR that lands the durable lane, delete the unit tests that shaped the behavior.

One narrow exception: a pure function with heavy branching may keep a parameterized contract-style test. Even then, do not mock internal modules. If a unit test cannot be replaced by a slice integration test, the slice boundary is wrong — fix the boundary, then delete the scaffolding.

## Example

Shaping a new transform (scaffolding, disposable):

```typescript
test('normalizes repository names in check_run payloads', () => {
  const normalized = normalizeRepoName('WebMCP-org/Sigvelo');
  expect(normalized).toBe('webmcp-org/sigvelo');
});
```

Durable replacement (slice integration, real code path):

```typescript
test('POST /github/webhook persists the normalized repo name', async () => {
  const body = JSON.stringify(buildCheckRunPayload());
  const response = await worker.fetch('/api/github/webhook', {
    method: 'POST',
    headers: signedHeaders(body),
    body,
  });

  expect(response.status).toBe(202);
  const run = await getRunByHeadSha('abc123');
  expect(run.repoFullName).toBe('webmcp-org/sigvelo');
});
```

Once the second test lands, delete the first in the same PR.

Example implements: [Disposable Unit Tests](disposable-unit-tests.md), [Integration-First Testing](integration-first-testing.md), [Delete Obsolete Code](delete-obsolete-code.md).
