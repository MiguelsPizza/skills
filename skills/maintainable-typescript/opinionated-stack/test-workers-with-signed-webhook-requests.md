---
example:
  primary: test-workers-with-signed-webhook-requests
  format: code
  implements:
    - test-workers-with-signed-webhook-requests
    - integration-first-testing
    - sign-webhooks-in-tests
    - schema-validate-test-fixtures
references:
  authority:
    - title: Cloudflare Workers Vitest Integration
      url: https://developers.cloudflare.com/workers/testing/vitest-integration/
    - title: GitHub Webhook Signature Validation
      url: https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
    - title: oRPC OpenAPI Getting Started
      url: https://orpc.dev/docs/openapi/getting-started
  supporting: []
---
# Test Workers with Signed Webhook Requests

**Rule:** For Cloudflare Workers apps whose public surface includes webhook ingestion, the canonical backend integration test drives a real HTTP request through the Workers runtime using `@cloudflare/vitest-pool-workers`, signs the payload the way the real provider does, and asserts the downstream state through another real endpoint. Pure helper tests are not a substitute.

See also: [Integration-First Testing](../references/integration-first-testing.md), [Sign Webhooks in Tests](../references/sign-webhooks-in-tests.md), [Schema-Validate Test Fixtures](../references/schema-validate-test-fixtures.md), and [Opinionated Stack Overview](stack-overview.md).

## Why agents get this wrong

Agents keep the backend test suite at the helper level: parse a payload, run a transform, assert the output. That is useful as disposable scaffolding, but it leaves the product contract untested. The webhook endpoint, the signature verifier, the routing middleware, the persistence layer, and the projection endpoint all drift independently because nothing exercises them together.

When asked to add an integration test, agents then reach for the next worst option: a test that boots an isolated handler under Node with an ad-hoc shim of the Workers runtime. That shim does not match Cloudflare's runtime semantics — Durable Objects, KV, R2, `ExecutionContext`, request-scoped `waitUntil`, and environment bindings all behave differently — so the test is green while the deployed worker misbehaves. The worst version of this is an in-memory mock of the verifier, which disables the one thing the test was supposed to cover.

## What to do instead

Use the Cloudflare Workers Vitest integration (`@cloudflare/vitest-pool-workers`) so tests run in the real Workers runtime with the real bindings and per-test-file storage isolation. Inside that pool, the webhook integration test:

1. Builds a contract-validated payload using a shared fixture builder ([Schema-Validate Test Fixtures](../references/schema-validate-test-fixtures.md)).
2. Signs the body with the test helper ([Sign Webhooks in Tests](../references/sign-webhooks-in-tests.md)).
3. Calls the worker's real HTTP endpoint with `SELF.fetch`.
4. Asserts the documented response status code.
5. Asserts the downstream state through a second real call — the run projection endpoint, a durable object read, or a D1 query — not via internal helper output.

The webhook endpoint is a product contract. Treat it like one.

## Example

Vitest config:

```typescript
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    include: ['tests/backend/**/*.test.ts'],
    setupFiles: ['./tests/backend/setup.ts'],
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.toml' },
      },
    },
  },
});
```

Integration test:

```typescript
import { SELF } from 'cloudflare:test';
import { describe, expect, test } from 'vitest';
import { buildCheckRunPayload } from '../contracts/github-webhooks';
import { signGithubWebhook } from '../helpers/sign-github-webhook';

describe('POST /api/github/webhook', () => {
  test('advances a run to completed on a signed check_run payload', async () => {
    const body = JSON.stringify(
      buildCheckRunPayload({
        check_run: { id: 4242, head_sha: 'abc123', conclusion: 'success' },
      }),
    );

    const response = await SELF.fetch('http://127.0.0.1/api/github/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-github-event': 'check_run',
        'x-hub-signature-256': signGithubWebhook(body),
      },
      body,
    });

    expect(response.status).toBe(202);

    const projection = await SELF.fetch(
      'http://127.0.0.1/api/nanites/runs/pr%3A21%3Aabc123',
    );
    const run = await projection.json();
    expect(run.status).toBe('completed');
  });

  test('rejects a tampered signature', async () => {
    const body = JSON.stringify(buildCheckRunPayload());
    const response = await SELF.fetch('http://127.0.0.1/api/github/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-github-event': 'check_run',
        'x-hub-signature-256': 'sha256=deadbeef',
      },
      body,
    });

    expect(response.status).toBe(401);
  });
});
```

Example implements: [Test Workers with Signed Webhook Requests](test-workers-with-signed-webhook-requests.md), [Integration-First Testing](../references/integration-first-testing.md), [Sign Webhooks in Tests](../references/sign-webhooks-in-tests.md), [Schema-Validate Test Fixtures](../references/schema-validate-test-fixtures.md).

## The test

Before calling a backend test an integration test, ask:

- Does it hit the real HTTP endpoint through the Workers runtime, or just a helper function?
- Is the payload signed the way the real provider signs it, or did I disable the verifier?
- Did I assert downstream state through another real endpoint, or against internal helper output?
- Does the test use `@cloudflare/vitest-pool-workers` so bindings, storage, and request context match production?

If any answer is no, it is a helper unit test wearing an integration name.
