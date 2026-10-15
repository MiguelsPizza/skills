---
example:
  primary: comments-say-why-not-what
  format: code
  implements:
    - comments-say-why-not-what
    - jsdoc-with-first-party-sources
    - naming-is-navigation
---
# Comments Say Why, Not What

**Rule:** Do not narrate code with inline comments. Put real documentation on the owning export, and only when it adds information the code does not already carry.

See also: [Comments and JSDoc Must Carry Information](../../stack/jsdoc-with-first-party-sources.md) for the full comment and JSDoc policy.

## Why agents get this wrong

Comments such as `// fetch the user` above `fetchUser()` repeat the code and become stale when it changes.

## What to do instead

Let code explain its behavior. Keep comments that explain rationale, constraints, provenance, or guarantees; delete the rest. Document reusable public exports more thoroughly than ordinary app code.

Follow the linked stack policy for JSDoc and authoritative sources.

## Example

Use single-line `//` comments sparingly for non-obvious constraints that do not need a JSDoc block.

```typescript
const repo = await octokit.repos.get({ owner, repo });
// GitHub returns 404 for non-members even on public repos — must fetch before checking membership
```

Example implements: [Comments Say Why, Not What](./comments-say-why-not-what.md), [Comments and JSDoc Must Carry Information](../../stack/jsdoc-with-first-party-sources.md), [Naming Is Navigation](./naming-is-navigation.md).
