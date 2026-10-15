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

**Rule:** Parse payloads invented by durable tests with a runtime schema before returning or sending them.

See also: [SSOT or Die](../abstractions/ssot-or-die.md) and [Boundaries Validate, Internals Trust](../boundaries/boundaries-validate-internals-trust.md).

## Why agents get this wrong

Hand-written JSON fixtures drift from real contracts as fields are renamed, required fields change, or nested shapes evolve. The tests may still compile.

## What to do instead

Build each synthetic payload through its canonical runtime schema before serializing or returning it. Use the app-owned contract schema for app data and an explicit external-boundary schema for provider data.

Validate where the test invents the data; internal consumers can trust the parsed result.

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

Example implements: [Contract-Gate Synthetic Fixtures](./contract-gate-synthetic-fixtures.md), [SSOT or Die](../abstractions/ssot-or-die.md), [Boundaries Validate, Internals Trust](../boundaries/boundaries-validate-internals-trust.md).
