---
example:
  primary: integration-first-testing
  format: code
  implements:
    - integration-first-testing
    - no-type-casts
    - boundaries-validate-internals-trust
---
# Integration-First Testing

**Rule:** Default to integration tests at real product boundaries, stabilize module ownership before building a large harness, and mock external boundaries only.

See also: [No Type Casts](../boundaries/no-type-casts.md).

## Why agents get this wrong

Tests that mock databases, sibling modules, and internal services can miss integration failures. Call-order assertions also break when working code is refactored.

## What to do instead

Fix known problems with file splits, package placement, or route decomposition before building a large harness around them.

Choose tests by the behavior they cover:

1. Contract tests for schemas, serialization, and pure transforms.
2. Feature integration tests for behavior across owned modules.
3. Browser tests for browser APIs, route wiring, and DOM behavior.
4. Request-driven backend integration tests for server routes, webhooks, auth flows, and persisted state transitions.
5. End-to-end tests for critical journeys across the frontend and backend.

Mock HTTP and network edges or third-party SDK internals only when they are outside the subject under test. Control time, randomness, and UUIDs when needed for determinism. Do not replace owned modules with mocks to assert call order.

Parse invented fixtures through runtime schemas before sending or returning them. Assert rendered output, HTTP behavior, persisted state, projections, and published artifacts. Assert a helper call only when the call itself is the public contract.

Use deterministic waits such as `vi.waitFor` or `expect.poll`. Reset state in `beforeEach` and clean up in `afterEach`.

## Example

Slice integration test

```typescript
import { createReviewRunResponseSchema } from '@repo/contracts/review-runs/create-review-run';
import { TEST_INSTALLATION_ID } from '@/test/test-installation-id';
import { getReviewRun } from '@repo/db/review-runs/get-review-run';
import { createApp } from '@/routes/app';
import { createTestDatabase } from '@/test/create-test-database';

test('POST /review-runs validates the request and persists a review run', async () => {
  const db = await createTestDatabase();
  const app = createApp({ db });

  const response = await app.request('/review-runs', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      installationId: TEST_INSTALLATION_ID,
      pullRequestNumber: 42,
    }),
  });

  expect(response.status).toBe(201);

  const body = createReviewRunResponseSchema.parse(await response.json());
  await expect(getReviewRun(db, body.reviewRunId)).resolves.toMatchObject({
    installationId: TEST_INSTALLATION_ID,
    pullRequestNumber: 42,
  });
});
```

Boundary contract test

```typescript
import { createReviewRunInputSchema } from '@repo/contracts/review-runs/create-review-run';

test('createReviewRunInputSchema rejects a missing installationId', () => {
  const result = createReviewRunInputSchema.safeParse({ pullRequestNumber: 42 });
  expect(result.success).toBe(false);
});
```

Example implements: [Integration-First Testing](./integration-first-testing.md), [No Type Casts](../boundaries/no-type-casts.md), [Boundaries Validate, Internals Trust](../boundaries/boundaries-validate-internals-trust.md).
