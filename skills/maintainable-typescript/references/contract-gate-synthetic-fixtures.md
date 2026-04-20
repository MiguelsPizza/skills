---
example:
  primary: contract-gate-synthetic-fixtures
  format: code
  implements:
    - contract-gate-synthetic-fixtures
    - ssot-or-die
    - boundaries-validate-internals-trust
---
# Contract-Gate Synthetic Fixtures

**Rule:** Any payload invented by a durable test should be parsed by a runtime schema before the test returns it or sends it.

See also: [SSOT or Die](ssot-or-die.md) and [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md).

## Why agents get this wrong

Agents hand-write JSON fixtures inline because it is fast. That creates silent drift:

- renamed fields
- missing required fields
- wrong nested object shapes
- stale assumptions about external APIs

The tests still compile, but they stop modeling the real contract.

## What to do instead

Before a test injects synthetic data:

1. choose the canonical runtime schema
2. build the payload through that schema
3. only then serialize or return it

Prefer:

- app-owned schemas from the real contract package
- explicit external-boundary schemas when the payload belongs to a third-party provider

Do not normalize this as "validation everywhere." The point is to validate at the synthetic edge where the test invents data.

## Example

```typescript
const payload = listUsersResponseSchema.parse({
  users: [{ id: "usr_123", name: "Ada Lovelace" }],
});

worker.use(
  http.get("/api/users", () => HttpResponse.json(payload)),
);
```

External provider example:

```typescript
const payload = gitHubPullRequestWebhookPayloadSchema.parse({
  action: "opened",
  repository: { id: 101, full_name: "acme/app" },
  installation: { id: 1 },
  pull_request: { number: 42, html_url: "https://github.com/acme/app/pull/42" },
});
```

Example implements: [Contract-Gate Synthetic Fixtures](contract-gate-synthetic-fixtures.md), [SSOT or Die](ssot-or-die.md), [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md).
