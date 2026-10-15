---
example:
  primary: external-boundary-mocks-only
  format: code
  implements:
    - external-boundary-mocks-only
    - integration-first-testing
    - boundaries-validate-internals-trust
---
# Mock External Boundaries Only

**Rule:** Durable tests may fake external systems, clocks, randomness, and UUIDs; they must exercise your own modules, routers, stores, and services.

See also: [Integration-First Testing](./integration-first-testing.md).

## Why agents get this wrong

Mocking sibling modules and internal services bypasses the code that can break. A passing test may prove only that the mocks agree.

## What to do instead

Mock third-party HTTP APIs and SDK calls. Control clocks, randomness, and UUIDs when tests need determinism.

Exercise real route handlers, internal services, application stores, and query or state wiring. If a test needs several internal mocks, expand its scope to cover those modules together.

## Example

Wrong:

```typescript
vi.mock("@/backend/github");
vi.mock("@/backend/nanites");
vi.mock("@/backend/store");
```

Better:

```typescript
worker.use(
  http.get("https://api.github.com/app/installations/1/access_tokens", () =>
    HttpResponse.json(githubTokenSchema.parse({ token: "test-token" })),
  ),
);
```

Example implements: [Mock External Boundaries Only](./external-boundary-mocks-only.md), [Integration-First Testing](./integration-first-testing.md), [Boundaries Validate, Internals Trust](../boundaries/boundaries-validate-internals-trust.md).
