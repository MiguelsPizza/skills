---
example:
  primary: treat-critical-code-like-a-library
  format: code
  implements:
    - treat-critical-code-like-a-library
    - monorepo-package-boundaries
    - integration-first-testing
    - maintainability-equals-correctness
---
# Treat Critical Code Like a Library

**Rule:** Give foundational auth, security, protocol, and critical business logic dedicated packages or library-style modules with explicit exports, documentation, and thorough tests.

See also: [Monorepo Package Boundaries](../packages/monorepo-package-boundaries.md), [Integration-First Testing](../testing/integration-first-testing.md), [Maintainability Equals Correctness](./maintainability-equals-correctness.md), and [Comments and JSDoc Must Carry Information](../../stack/jsdoc-with-first-party-sources.md).

## Why agents get this wrong

Security checks scattered through route handlers are hard to audit and test. In auth, protocol handling, and critical business logic, weak boundaries and missing edge cases can compromise access control or break production behavior.

## What to do instead

Treat critical code as a maintained internal library:

1. Give it a clear ownership boundary, usually a dedicated package when it is shared or foundational.
2. Expose explicit public entrypoints through `package.json` subpath exports that point at owning modules.
3. Write package docs and JSDoc for public exports.
4. Write tests before or alongside implementation for security, protocol handling, and other costly failure modes.
5. Cover adversarial inputs and edge cases thoroughly.

Use TDD to define the contract for security, auth, token handling, protocol validation, and high-risk business rules.

A one-off feature can stay in the app. Use library discipline for foundational code with multiple consumers or system-wide risk.

## Example

```text
packages/auth/
  src/
    oidc/jwt-verifier.ts
    oidc/discovery.ts
    security/ssrf.ts
    errors/codes.ts
  tests/
    oidc/jwt-verifier.test.ts
    oidc/discovery.test.ts
    security/ssrf.test.ts
  package.json
  vitest.config.ts
```

Point public paths directly at their owners.

```json
{
  "name": "@repo/auth",
  "exports": {
    "./oidc/jwt-verifier": "./src/oidc/jwt-verifier.ts",
    "./security/ssrf": "./src/security/ssrf.ts",
    "./errors/codes": "./src/errors/codes.ts"
  }
}
```

Contract-first test

```typescript
import { verifyUserIdentity } from '@repo/auth/oidc/jwt-verifier';

test('rejects tokens with the wrong issuer', async () => {
  const token = await createToken({ issuer: 'https://evil.example.com' });

  const result = await verifyUserIdentity({
    authToken: token,
    idpConfig: baseIdpConfig,
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.errorCode).toBe('INVALID_ISSUER');
  }
});
```

Example implements: [Treat Critical Code Like a Library](./treat-critical-code-like-a-library.md), [Monorepo Package Boundaries](../packages/monorepo-package-boundaries.md), [Integration-First Testing](../testing/integration-first-testing.md), [Maintainability Equals Correctness](./maintainability-equals-correctness.md).
