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

**Rule:** Foundational auth, security, protocol, and runtime-critical business logic should be extracted into dedicated packages or library-style modules with explicit exports, excellent documentation, and strong test coverage.

See also: [Monorepo Package Boundaries](monorepo-package-boundaries.md), [Integration-First Testing](integration-first-testing.md), [Maintainability Equals Correctness](maintainability-equals-correctness.md), and [Comments and JSDoc Must Carry Information](../opinionated-stack/jsdoc-with-first-party-sources.md).

## Why agents get this wrong

Agents treat important code the same way they treat leaf feature code. They leave auth logic in an app directory, mix security checks into route handlers, skip package-level docs, and write only enough tests to satisfy the current change.

That is exactly backwards for code where mistakes are expensive.

Critical runtime code creates security vulnerabilities, corrupts access control, breaks protocol compatibility, and produces subtle production incidents. If that code is sloppy, under-tested, or hard to navigate, the whole repo inherits the risk.

## What to do instead

Treat critical code as if you were publishing a small internal library.

That means:

1. Give it a clear ownership boundary, usually a dedicated package when it is shared or foundational.
2. Expose explicit public entrypoints instead of letting consumers reach into internal files.
3. Write package-level docs and strong JSDoc on the exports that other code will depend on.
4. Build the tests first or very close to first when the behavior is security-sensitive, protocol-sensitive, or expensive to get wrong.
5. Bias toward exhaustive edge-case coverage, not just happy-path verification.

This is where test-driven development makes the most sense. For security, auth, token handling, protocol validation, and high-risk business rules, TDD is not ceremony. It is a way to lock the contract before implementation details sprawl.

Do not read this as "everything important must become a package." A one-off app feature can stay in the app. Foundational code with multiple consumers or system-wide risk should look like a maintained library, not incidental app glue.

## Example

```text
packages/auth/
  src/
    index.ts
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

Package entrypoint

```typescript
/**
 * Internal authentication library.
 *
 * Owns token verification, issuer validation, JWKS handling, and auth error contracts.
 *
 * Consumers should import from this package entrypoint instead of reaching into internal files.
 */
export { verifyUserIdentity, type VerifyUserIdentityOptions } from './oidc/jwt-verifier';
export { validateDiscoveryUrl, validateJwksUri } from './security/ssrf';
export {
  AUTH_ERROR_CODE,
  type AuthErrorCode,
  createAuthErrorResponse,
} from './errors';
```

Contract-first test

```typescript
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

Example implements: [Treat Critical Code Like a Library](treat-critical-code-like-a-library.md), [Monorepo Package Boundaries](monorepo-package-boundaries.md), [Integration-First Testing](integration-first-testing.md), [Maintainability Equals Correctness](maintainability-equals-correctness.md).

## The test

Ask: would a production failure in this code be a serious incident? Does it have multiple consumers or system-wide effect? Is the public surface explicit enough to use without spelunking internals? Does the test suite cover adversarial and edge-case behavior? If yes, treat it like a library. If not, the boundary and test discipline are too weak.
