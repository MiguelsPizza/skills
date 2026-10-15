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

**Rule:** Document information code and types cannot express, usually as targeted JSDoc on the owning export. Keep line-level comments rare.

See also: [Comments Say Why, Not What](../doctrine/foundations/comments-say-why-not-what.md), [No Magic Values](./no-magic-values.md), and [SSOT or Die](../doctrine/abstractions/ssot-or-die.md).

## Why agents get this wrong

Comments that narrate code and JSDoc that repeats signatures bury useful constraints. Public library APIs can have the opposite problem: missing usage expectations and guarantees.

## What to do instead

Document public and reusable APIs with JSDoc when readers need contract details, usage expectations, failure behavior, side effects, or guarantees. Internal app exports need JSDoc only when such information is otherwise missing.

Use JSDoc for provenance, units, indexing, timezones, normalization, intentional thresholds, and constraints readers need on hover. Avoid signature restatements, obvious private-helper docs, narrated steps, and repeated explanations at call sites. A single inline comment is acceptable for a constraint specific to one line.

Put provenance on the owner with `@see`:

- Vendor facts: link to the defining vendor or standards document.
- Internal contracts and constants: link to the owning code or schema.
- Derived values: link to the checked-in derivation or proof and any external source it uses.
- Vendored references: link to the vendored proof and record its pinned version metadata.
- Values without an authority: say `Arbitrary` and explain the rationale.

Consumers import the documented owner; they do not repeat its source links.

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

Example implements: [Comments and JSDoc Must Carry Information](./jsdoc-with-first-party-sources.md), [Comments Say Why, Not What](../doctrine/foundations/comments-say-why-not-what.md), [No Magic Values](./no-magic-values.md).
