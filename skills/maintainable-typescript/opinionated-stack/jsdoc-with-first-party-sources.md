---
example:
  primary: jsdoc-with-first-party-sources
  format: code
  implements:
    - jsdoc-with-first-party-sources
    - comments-say-why-not-what
    - no-magic-values
---
# Comments and JSDoc Must Carry Information

**Rule:** Use almost no line-level comments. When documentation is needed, put it on the owning export as targeted JSDoc that explains something code and types do not already say.

See also: [Comments Say Why, Not What](../references/comments-say-why-not-what.md), [No Magic Values](no-magic-values.md), and [SSOT or Die](../references/ssot-or-die.md).

## Why agents get this wrong

Agents over-comment. They add `//` comments that narrate obvious code, then add JSDoc that restates the signature in English, then sprinkle more comments at call sites because they cannot decide where the explanation belongs.

That produces a repo full of words with almost no information. The next contributor has to read through boilerplate commentary to find the one thing that actually matters: the reason, constraint, provenance, or guarantee that the code itself does not make obvious.

Agents also under-document public APIs. Reusable library exports often need much better docs than internal app code, but agents treat both the same.

## What to do instead

Write code so the implementation explains what it does. Use comments only to carry information the code cannot.

Default policy:
- no line-level `// what this does` comments
- no boilerplate JSDoc that just repeats the function name, parameter names, or obvious return type
- no repeated provenance on consumer imports or usage sites
- one rare single-line inline comment is acceptable for a local constraint that applies to one specific line

Bias by code kind:
- public-facing libraries and reusable exported APIs should bias toward high-quality JSDoc
- most internal app code should have little or no JSDoc unless provenance, guarantees, or constraints matter

Use JSDoc when an owning export needs one or more of these:
- public API contract or usage expectations
- provenance or authoritative source
- units, indexing base, timezone, normalization, or other conventions
- guarantees, failure behavior, or side effects
- arbitrary-but-intentional values or thresholds
- non-obvious constraints that should appear on hover

Do not use JSDoc for:
- restating the signature
- consumer-side repetition
- obvious private helpers
- narrating implementation steps

When provenance matters, put it on the owning export with `@see`.

Choose the authoritative source by fact type:
- vendor-defined facts: link to the vendor or standards doc that defines it
- internal contracts and owned constants: link to the owning repo code or schema
- derived values: link to checked-in derivation or design proof, plus an external source when the derivation depends on one
- vendored references: link to the vendored proof and record pinned version metadata alongside it
- no authority available: say `Arbitrary` and explain the rationale

Provenance belongs on the owner, not on every consumer. If `PRIMARY_COMPLETION_MODEL` is documented in its owning module, importers should use the constant, not copy its source links into usage sites.

## Example

Bad line-level narration

```typescript
import type { ReviewRun } from '@repo/contracts/review-runs/review-run';
import { REVIEW_RUN_STATUS } from '@repo/contracts/review-runs/review-run';

function isCompletedReviewRun(reviewRun: ReviewRun): boolean {
  // Check whether the review run is completed.
  return reviewRun.status === REVIEW_RUN_STATUS.COMPLETED;
}
```

Acceptable rare inline comment

```typescript
const repo = await octokit.repos.get({ owner, repoName });
// GitHub returns 404 for non-members even on public repos, so fetch before membership checks.
```

Good library export JSDoc

```typescript
/**
 * Claude model used for default synchronous text generation.
 *
 * Chosen as the default request path because it balances latency and output quality.
 *
 * @see https://docs.anthropic.com/en/docs/about-claude/models/overview
 * @see ./.sources/model-selection-notes.md
 */
export const PRIMARY_COMPLETION_MODEL = 'claude-sonnet-4-20250514';
```

Good internal export JSDoc when provenance matters

```typescript
/**
 * Standard inch-to-meter conversion factor used by the blur-to-pixel equation.
 *
 * @see ./.sources/blur-to-pixel-derivation.md
 * @see https://www.nist.gov/pml/owm/si-units-length
 */
export const METERS_PER_INCH = 0.0254;
```

No JSDoc for an obvious internal helper

```typescript
import type { ReviewRun } from '@repo/contracts/review-runs/review-run';
import { REVIEW_RUN_STATUS } from '@repo/contracts/review-runs/review-run';

function isCompletedReviewRun(reviewRun: ReviewRun): boolean {
  return reviewRun.status === REVIEW_RUN_STATUS.COMPLETED;
}
```

Example implements: [Comments and JSDoc Must Carry Information](jsdoc-with-first-party-sources.md), [Comments Say Why, Not What](../references/comments-say-why-not-what.md), [No Magic Values](no-magic-values.md).
