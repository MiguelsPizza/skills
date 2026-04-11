---
example:
  primary: test-workers-in-the-workers-runtime
  format: code
  implements:
    - test-workers-in-the-workers-runtime
    - integration-first-testing
    - push-mocks-to-the-edge
    - schema-validate-test-fixtures
references:
  authority:
    - title: Cloudflare Workers Vitest Integration
      url: https://developers.cloudflare.com/workers/testing/vitest-integration/
    - title: oRPC OpenAPI Getting Started
      url: https://orpc.dev/docs/openapi/getting-started
  supporting: []
---
# Test Workers in the Workers Runtime

**Rule:** Tests for Cloudflare Workers code run inside the Workers runtime, not Node. Use `@cloudflare/vitest-pool-workers` so bindings, Durable Objects, KV, R2, D1, queues, `ExecutionContext`, and `waitUntil` behave exactly the way production behaves. Drive the app through its real HTTP entrypoint, and stub only the outermost third-party HTTP calls.

See also: [Integration-First Testing](../references/integration-first-testing.md), [Push Mocks to the Edge](../references/push-mocks-to-the-edge.md), [Schema-Validate Test Fixtures](../references/schema-validate-test-fixtures.md), and [Opinionated Stack Overview](stack-overview.md).

## Why agents get this wrong

Agents write "Workers tests" in plain Node with an ad-hoc shim: a hand-built `env` object, a fake `ExecutionContext`, a stub fetch for bindings, and a direct call into an inner handler function. Everything that actually makes a Worker a Worker — the runtime API surface, the binding semantics, the per-request context, the `waitUntil` deferral, the isolate-per-test storage — is replaced by a sketch. The test goes green because the sketch agrees with itself, not because the deployed worker works.

The same agents then put every mock next to the subject. The signature verifier is stubbed, the router is skipped, the Durable Object is replaced with a class returning canned data, and the handler is called directly with a synthesized `Request`. Production runs a long real pipeline; the test runs a short fake one. Any bug that lives in the gap between the two ships to production untouched.

## What to do instead

Two rules, applied together:

1. **Run tests inside the Workers runtime.** Use `@cloudflare/vitest-pool-workers`. There is no Node shim layer to drift from production — bindings, DOs, KV, R2, D1, queues, and per-test-file storage isolation all behave the same way the deployed worker behaves.
2. **Drive the app through its real HTTP entrypoint.** Use `SELF.fetch('http://.../api/...')` so the request flows through the real router, the real middleware, the real validators, the real handler, and the real store. Push every test double outward, per [Push Mocks to the Edge](../references/push-mocks-to-the-edge.md). MSW-level stubs of outbound third-party HTTP and deterministic clock/UUID providers at the composition root are legitimate. Anything closer to the subject is not.

If the endpoint enforces authenticity — webhook signatures, bearer tokens, mTLS — the test supplies a real credential for the test environment and the real verifier runs. Do not bypass the verifier, do not mock the middleware, and do not add a debug-mode skip. If the endpoint writes to a store, the test reads back from the same store through the same binding and asserts the persisted state.

That is what "match the real app" means for a Worker.

## Example

Vitest config:

```typescript
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    include: ['tests/backend/**/*.test.ts'],
    poolOptions: {
      workers: { wrangler: { configPath: './wrangler.toml' } },
    },
  },
});
```

Integration test — real runtime, real endpoint, outbound-edge MSW only:

```typescript
import { SELF, env } from 'cloudflare:test';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { buildCheckRunPayload } from '../contracts/github-webhooks';
import { webhookDeliveryHeaders } from '../helpers/webhook-delivery';

const outbound = setupServer(
  http.post('https://api.github.com/repos/:owner/:repo/check-runs', () =>
    HttpResponse.json({ id: 4242 }),
  ),
);

beforeAll(() => outbound.listen({ onUnhandledRequest: 'error' }));
afterAll(() => outbound.close());

describe('POST /api/github/webhook', () => {
  test('advances a run to completed end to end', async () => {
    const body = JSON.stringify(buildCheckRunPayload());

    const response = await SELF.fetch('http://127.0.0.1/api/github/webhook', {
      method: 'POST',
      headers: webhookDeliveryHeaders(body),
      body,
    });

    expect(response.status).toBe(202);

    const stored = await env.RUNS.get('pr:21:abc123', 'json');
    expect(stored).toMatchObject({ status: 'completed' });
  });
});
```

Everything between `SELF.fetch` and `env.RUNS.get` is real: the router, the middleware, the verifier, the validators, the handler, the binding. The only double is the outbound GitHub API — a third-party edge the test cannot legitimately reach.

Example implements: [Test Workers in the Workers Runtime](test-workers-in-the-workers-runtime.md), [Integration-First Testing](../references/integration-first-testing.md), [Push Mocks to the Edge](../references/push-mocks-to-the-edge.md), [Schema-Validate Test Fixtures](../references/schema-validate-test-fixtures.md).

## The test

Before calling a Workers test an integration test, ask:

- Is it running under `@cloudflare/vitest-pool-workers`, or under plain Node with a shim?
- Did the request flow through `SELF.fetch` and the real router, or straight into an inner handler function?
- Are all the middleware layers — auth, validation, logging — actually executing?
- Is every mock outside the app, at a third-party HTTP edge or at a clock/randomness injection point?

If any answer is no, the test is exercising a sketch of the Worker, not the Worker.
