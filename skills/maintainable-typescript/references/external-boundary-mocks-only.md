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

**Rule:** Durable tests may fake systems you do not control. They should not fake your own modules, routers, stores, or internal services.

See also: [Integration-First Testing](integration-first-testing.md).

## Why agents get this wrong

Agents reach for whatever makes the test easiest to write:

- `vi.mock`
- spies on sibling modules
- fake stores
- fake routers
- stubs for internal services

That makes the test green, but it disconnects the regression from the real boundary where the product can break.

## What to do instead

Ask one question first:

"Is the thing I want to fake outside the system I own?"

Mocking is usually acceptable for:

- third-party HTTP APIs
- external SDK calls
- clocks, randomness, and UUIDs when determinism matters

Mocking is usually wrong for:

- sibling app modules
- route handlers
- internal service classes
- application stores
- your own query or state management wiring

If the test needs multiple internal mocks, the lane is probably wrong. Move outward until the subject under test is a real slice.

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

Example implements: [Mock External Boundaries Only](external-boundary-mocks-only.md), [Integration-First Testing](integration-first-testing.md), [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md).
