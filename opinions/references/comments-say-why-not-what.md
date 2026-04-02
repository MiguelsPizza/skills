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

**Rule:** No inline `//` comments that describe what code does. If documentation is needed, use JSDoc on the export with source attribution. Code should be self-explanatory; documentation should explain *why* and link to *where*.

See also: [JSDoc with First-Party Sources](../opinionated-stack/jsdoc-with-first-party-sources.md) for the full source attribution convention.

## Why agents get this wrong

Agents scatter `// explanation` throughout function bodies. These comments are invisible to tooling — IDEs don't show them on hover, documentation generators skip them, and they go stale when code changes. Agents also add JSDoc that restates the function signature in English, which is pure noise when TypeScript already provides the types.

## What to do instead

Write self-documenting code. If the code needs a "what" comment to be understood, rename the variable or extract a well-named function instead.

When documentation IS needed, use JSDoc on the export — not inline comments in the body. JSDoc is visible on hover, surfaced by tooling, and has a structured place for source links via `@see`.

## Example

```typescript
/**
 * GitHub REST pagination starts at page 1, but the UI pager is 0-indexed.
 *
 * @see https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api
 */
export function toGitHubPageNumber(zeroIndexedPage: number): number {
  return zeroIndexedPage + 1;
}
```

Example implements: [Comments Say Why, Not What](comments-say-why-not-what.md), [JSDoc with First-Party Sources](../opinionated-stack/jsdoc-with-first-party-sources.md), [Naming Is Navigation](naming-is-navigation.md).
## The only acceptable inline comment

A single-line `//` is acceptable when explaining a non-obvious constraint that applies to one specific line and doesn't warrant a full JSDoc block. These should be rare.

```typescript
const repo = await octokit.repos.get({ owner, repo });
// GitHub returns 404 for non-members even on public repos — must fetch before checking membership
```

If you're writing more than one line of inline comment, it belongs in JSDoc on the enclosing function.
