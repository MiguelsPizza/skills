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

See also: [Comments and JSDoc Must Carry Information](../opinionated-stack/jsdoc-with-first-party-sources.md) for the full comment and JSDoc policy.

## Why agents get this wrong

Agents narrate code by default. They add `// fetch the user` above a `fetchUser()` call, `// check if valid` above an `isValid` branch, and `// return the result` above a return statement. Every line gets a caption that restates what the code already says. The result is twice the reading with zero additional understanding, and the comments rot the moment the code changes.

## What to do instead

Use this file as the short version:
- code should explain what
- comments should explain why, constraints, provenance, or guarantees
- most line comments should be deleted
- reusable public exports deserve better JSDoc than ordinary app code

For the full rule, examples, and authoritative-source guidance, use the main doctrine file above.

## Example

A single-line `//` is acceptable when explaining a non-obvious constraint that applies to one specific line and doesn't warrant a full JSDoc block. These should be rare.

```typescript
const repo = await octokit.repos.get({ owner, repo });
// GitHub returns 404 for non-members even on public repos — must fetch before checking membership
```

Example implements: [Comments Say Why, Not What](comments-say-why-not-what.md), [Comments and JSDoc Must Carry Information](../opinionated-stack/jsdoc-with-first-party-sources.md), [Naming Is Navigation](naming-is-navigation.md).
