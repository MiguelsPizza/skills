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

**Rule:** Default to slice integration tests. Use contract tests for pure logic. Use browser tests for browser behavior. Mock external boundaries only. If a test needs multiple internal mocks, rewrite it as a slice integration test.

See also: [No Type Casts](no-type-casts.md).

## Why agents get this wrong

Agents write isolated unit tests with heavy mocking. They mock the database, mock sibling modules, mock internal services — then assert that the code called the mocks in the right order. These tests pass when the implementation is correct but tell you nothing about whether the system actually works. They break on every refactor because they test choreography, not behavior.

## What to do instead

Use this test stack:

1. Contract tests for schemas, serialization, and pure transforms.
2. Slice integration tests as the default for feature behavior.
3. Browser tests for real browser APIs and DOM/runtime semantics.
4. End-to-end tests for critical cross-package journeys.

Mock external boundaries only:
- HTTP and network edges
- time, randomness, and UUIDs when determinism matters
- third-party SDK internals outside the subject under test

Do not mock sibling modules just to assert call order. If a test needs multiple internal mocks, the test shape is wrong.

Use deterministic waits such as `vi.waitFor` or `expect.poll`. Clean up state in `beforeEach` and `afterEach`.

## Example

Slice integration test

```typescript
import { createReviewRunResponseSchema } from '@repo/shared-types/review-runs/create-review-run';
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
import { createReviewRunInputSchema } from '@repo/shared-types/review-runs/create-review-run';

test('createReviewRunInputSchema rejects a missing installationId', () => {
  const result = createReviewRunInputSchema.safeParse({ pullRequestNumber: 42 });
  expect(result.success).toBe(false);
});
```

Example implements: [Integration-First Testing](integration-first-testing.md), [No Type Casts](no-type-casts.md), [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md).
