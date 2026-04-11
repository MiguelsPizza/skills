---
example:
  primary: schema-validate-test-fixtures
  format: code
  implements:
    - schema-validate-test-fixtures
    - ssot-or-die
    - boundaries-validate-internals-trust
---
# Schema-Validate Test Fixtures

**Rule:** Every payload a test synthesizes at a network or webhook edge — MSW response, webhook body, external API stub — must be parsed through the same runtime schema the production code uses before it reaches the subject under test.

See also: [SSOT or Die](ssot-or-die.md) and [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md).

## Why agents get this wrong

Agents hand-write fixture JSON inline in tests. The shape looks right, the test passes, and nobody notices that a required field is missing, a type is wrong, or an enum value has been removed from the contract. Production then crashes on the very response the test claimed to verify. The fixture was a silent lie and the test was cargo-culting a shape, not exercising a contract.

## What to do instead

Hand every synthetic payload to the same schema that guards the real boundary. Import the shared Zod schema (or OpenAPI-derived schema, or contract package) and call `.parse()` at the construction site of the fixture. If the fixture is invalid, the test fails at setup, not at assertion. Broken fixtures should be impossible to check in.

Rules:

- Prefer shared contract packages like `@repo/contracts/*` over locally defined fixture types.
- Fixture builders live in `tests/contracts/` or `tests/fixtures/`, not inline in each test body.
- Parsing happens before MSW returns the payload and before webhook delivery helpers send the request.
- Never cast past the schema check to make a test "work."

## Example

Fixture builder:

```typescript
// tests/contracts/github-webhooks.ts
import { checkRunPayloadSchema, type CheckRunPayload } from '@repo/contracts/github/webhooks';

export function buildCheckRunPayload(overrides?: Partial<CheckRunPayload>): CheckRunPayload {
  return checkRunPayloadSchema.parse({
    action: 'completed',
    check_run: { id: 1234, head_sha: 'abc123', conclusion: 'success' },
    repository: { full_name: 'WebMCP-org/sigvelo' },
    ...overrides,
  });
}
```

Usage in a browser + MSW test:

```typescript
import { http, HttpResponse } from 'msw';
import { reposResponseSchema } from '@repo/contracts/repos/list-repos';

worker.use(
  http.get('/api/repos', () =>
    HttpResponse.json(
      reposResponseSchema.parse({
        repos: [{ id: 101, fullName: 'WebMCP-org/sigvelo', defaultBranch: 'main' }],
      }),
    ),
  ),
);
```

Example implements: [Schema-Validate Test Fixtures](schema-validate-test-fixtures.md), [SSOT or Die](ssot-or-die.md), [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md).
