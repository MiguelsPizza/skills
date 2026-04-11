---
example:
  primary: sign-webhooks-in-tests
  format: code
  implements:
    - sign-webhooks-in-tests
    - integration-first-testing
    - boundaries-validate-internals-trust
---
# Sign Webhooks in Tests

**Rule:** Tests that exercise a webhook endpoint must sign the payload the same way the real provider does — GitHub's `X-Hub-Signature-256` HMAC, Stripe's `Stripe-Signature`, or whichever scheme the provider specifies. Do not bypass signature verification in durable tests except in explicit negative-path specs.

See also: [Integration-First Testing](integration-first-testing.md) and [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md).

## Why agents get this wrong

Agents skip the signing step. They add a `DISABLE_SIGNATURE_CHECK=true` debug bypass, stub the verifier module, or call the inner handler function directly so the middleware never runs. The "integration" test then exercises everything except the auth boundary that keeps attackers out. Signature regressions ship silently because nothing in the durable suite touches the real verifier.

## What to do instead

Add a small signing helper to the test harness that produces exactly the header the provider sends, using the same shared secret the worker reads from its environment. The test drives a real HTTP request through the live endpoint — same path, same middleware, same verifier. Add a negative-path test that sends a tampered body or wrong signature and asserts the handler rejects it with the documented status code.

Rules:

- The signing helper lives in `tests/helpers/`, not in app code.
- The test secret is read from an env var, never hard-coded in production config.
- Positive and negative paths both run through the real endpoint.
- Never stub the verifier and never add a debug-mode skip.

## Example

Signing helper:

```typescript
// tests/helpers/sign-github-webhook.ts
import { createHmac } from 'node:crypto';

export function signGithubWebhook(body: string, secret = process.env.TEST_WEBHOOK_SECRET!): string {
  return 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
}
```

Positive-path integration test:

```typescript
const body = JSON.stringify(buildCheckRunPayload());
const response = await fetch('http://127.0.0.1:8787/api/github/webhook', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-github-event': 'check_run',
    'x-hub-signature-256': signGithubWebhook(body),
  },
  body,
});

expect(response.status).toBe(202);
```

Negative-path integration test:

```typescript
const response = await fetch('http://127.0.0.1:8787/api/github/webhook', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-github-event': 'check_run',
    'x-hub-signature-256': 'sha256=deadbeef',
  },
  body: JSON.stringify(buildCheckRunPayload()),
});

expect(response.status).toBe(401);
```

Example implements: [Sign Webhooks in Tests](sign-webhooks-in-tests.md), [Integration-First Testing](integration-first-testing.md), [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md).
