---
example:
  primary: test-github-webhooks-as-signed-contracts
  format: code
  implements:
    - test-github-webhooks-as-signed-contracts
    - contract-gate-synthetic-fixtures
    - external-boundary-mocks-only
references:
  authority:
    - title: GitHub validating webhook deliveries
      url: https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
    - title: octokit/webhooks.js
      url: https://github.com/octokit/webhooks.js
  supporting: []
---
# Test GitHub Webhooks as Signed Contracts

**Rule:** GitHub webhooks are part of the product contract. Build a contract-validated payload, sign it exactly as GitHub does, and send it through the real webhook route.

See also: [Contract-Gate Synthetic Fixtures](../references/contract-gate-synthetic-fixtures.md) and [Mock External Boundaries Only](../references/external-boundary-mocks-only.md).

## Why agents get this wrong

Agents often test webhook handling by:

- bypassing signature validation
- calling an internal handler directly
- hand-writing raw JSON payloads with no runtime validation

That proves only a fraction of the real contract.

## What to do instead

Treat webhook handling as a boundary contract:

1. build the payload through a runtime schema
2. serialize the exact body that will be sent
3. compute the `X-Hub-Signature-256` header from that body
4. send the request through the real webhook endpoint
5. assert the downstream outcome, not just the route status

Negative tests should prove rejection for missing or invalid signatures.

## Example

```typescript
const payload = gitHubPullRequestWebhookPayloadSchema.parse({
  action: "opened",
  repository: { id: 101, full_name: "acme/app" },
  installation: { id: 1 },
  pull_request: { number: 42, html_url: "https://github.com/acme/app/pull/42" },
});

const body = JSON.stringify(payload);
const signature = await sign("test-webhook-secret", body);

const request = new Request("http://example.com/api/github/webhook", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-github-event": "pull_request",
    "x-hub-signature-256": signature,
  },
  body,
});
```

Example implements: [Test GitHub Webhooks as Signed Contracts](test-github-webhooks-as-signed-contracts.md), [Contract-Gate Synthetic Fixtures](../references/contract-gate-synthetic-fixtures.md), [Mock External Boundaries Only](../references/external-boundary-mocks-only.md).
