---
example:
  primary: push-mocks-to-the-edge
  format: code
  implements:
    - push-mocks-to-the-edge
    - integration-first-testing
    - boundaries-validate-internals-trust
---
# Push Mocks to the Edge

**Rule:** A test must match the real app running in a real environment as closely as possible. Any stub, mock, or test double belongs at the farthest outer boundary — third-party HTTP, a clock, a randomness source. Everything inside that boundary runs for real: routers, middleware, verifiers, validators, stores, and your own service modules.

See also: [Integration-First Testing](integration-first-testing.md) and [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md).

## Why agents get this wrong

Agents place doubles next to the subject. Testing a handler that reads from a store? Mock the repository. Testing a route behind auth? Stub the verifier. Testing a job that calls a vendor? Mock the client wrapper one file away. Each mock is put at the closest convenient spot, which is the exact opposite of matching production. The test runs a sterilized app where every middleware, router, validator, and persistence layer production relies on is quietly skipped. It passes, the deploy breaks, and nobody knows which skipped layer actually had the bug.

The inverse failure is "mock everything that isn't the subject." The test then asserts choreography — that the code called `repository.save(x)` with these arguments once — instead of behavior. That only verifies the code the author just wrote.

## What to do instead

Find the outermost real edge the app genuinely depends on and put the test double there. Typical outer edges:

- Outbound HTTP to third parties you do not own → MSW (or equivalent) at the HTTP layer, not at an SDK wrapper inside your app.
- Time, randomness, UUIDs → deterministic providers injected at the composition root, not sprinkled through internal modules.
- Stores and runtimes you do not own → a local production-equivalent (Postgres container, miniflare R2/KV/D1, a real SQLite file), not a repository-layer stub.
- Inbound requests → drive a real HTTP request into the real handler. Let the real router, the real middleware, the real auth, and the real validator all run.

Everything between that outer edge and the subject runs the same code production runs. If a behavior cannot be tested without stubbing something inside your own `src/`, the seam is wrong — fix the seam ([Split By Stable Seam](split-by-stable-seam.md)), then delete the stub. A test file that imports `vi.mock('./something')` or mocks a module living under your own package is a hint that a double has been pushed inward instead of outward.

## Example

Bad — stubs pushed all the way to the subject:

```typescript
vi.mock('./verify-webhook-signature', () => ({ verifyWebhookSignature: () => true }));
vi.mock('./repository', () => ({ saveRun: vi.fn().mockResolvedValue({ id: 'run_1' }) }));

test('handler saves a run', async () => {
  await handleWebhook(fakeRequest);
  expect(saveRun).toHaveBeenCalledWith(expect.objectContaining({ headSha: 'abc' }));
});
```

Good — the only double is at the third-party HTTP edge; everything else runs for real:

```typescript
outbound.use(
  http.post('https://api.github.com/repos/:owner/:repo/check-runs', () =>
    HttpResponse.json(checkRunResponseSchema.parse({ id: 4242 })),
  ),
);

const response = await SELF.fetch('http://127.0.0.1/api/github/webhook', {
  method: 'POST',
  headers: webhookDeliveryHeaders(body),
  body,
});

expect(response.status).toBe(202);
const run = await readRunFromRealStore('pr:21:abc');
expect(run.status).toBe('completed');
```

The second test exercises the real router, the real signature verifier, the real validators, the real handler, and the real store binding. The only mock is for the GitHub API — the one edge the test has no legitimate way to reach.

Example implements: [Push Mocks to the Edge](push-mocks-to-the-edge.md), [Integration-First Testing](integration-first-testing.md), [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md).
