---
example:
  primary: test-cloudflare-workers-through-real-requests
  format: code
  implements:
    - test-cloudflare-workers-through-real-requests
    - integration-first-testing
    - external-boundary-mocks-only
    - stack-overview
references:
  authority:
    - title: Cloudflare Workers Vitest integration
      url: https://developers.cloudflare.com/workers/testing/vitest-integration/
  supporting: []
---
# Test Cloudflare Workers Through Real Requests

**Rule:** In the Cloudflare stack, backend durable tests should send real requests through the Worker entrypoint, run in the Workers runtime, and fake only external providers.

See also: [Integration-First Testing](../references/integration-first-testing.md), [Mock External Boundaries Only](../references/external-boundary-mocks-only.md), and [Opinionated Stack](stack-overview.md).

## Why agents get this wrong

Agents test Worker apps like ordinary library code. They import helpers directly, stub internal modules, and assert on method calls. That misses the runtime behavior the product actually depends on:

- request routing
- headers and auth
- execution context behavior
- Durable Object dispatch
- binding access

## What to do instead

Use the Worker runtime test harness and prove behavior through requests:

1. build a real `Request`
2. send it through the Worker entrypoint
3. wait for async work when needed
4. assert a durable downstream outcome

Mock only the external systems you do not control, such as GitHub HTTP APIs.

Prefer follow-up assertions on:

- HTTP response shape
- persisted state
- projections
- emitted artifacts

## Example

```typescript
const request = new Request("http://example.com/api/github/webhook", {
  method: "POST",
  headers,
  body,
});

const ctx = createExecutionContext();
const response = await worker.fetch(request, env, ctx);
expect(response.status).toBe(200);

await waitOnExecutionContext(ctx);
expect(runProjection.status).toBe("completed");
```

Example implements: [Test Cloudflare Workers Through Real Requests](test-cloudflare-workers-through-real-requests.md), [Integration-First Testing](../references/integration-first-testing.md), [Mock External Boundaries Only](../references/external-boundary-mocks-only.md), [Opinionated Stack](stack-overview.md).
