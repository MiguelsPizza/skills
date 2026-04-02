---
example:
  primary: jsdoc-with-first-party-sources
  format: code
  implements:
    - jsdoc-with-first-party-sources
    - comments-say-why-not-what
    - no-magic-values
---
# JSDoc with First-Party Sources

**Rule:** Put documentation on exports as JSDoc with `@see` links to first-party sources. Do not leave provenance buried in inline comments.

See also: [Comments Say Why, Not What](../references/comments-say-why-not-what.md) and [No Magic Values](no-magic-values.md).

## Why agents get this wrong

Agents default to inline `//` comments because they are cheap to write in the local diff. Those comments do not show up in hover docs, are easy to miss in reviews, and rarely link to the authority behind a value or type.

That means the repo accumulates explanations without provenance. The next agent can see what a value is called, but not why it exists or where it came from.

## What to do instead

Document exported types, constants, and algorithms with JSDoc on the export itself.

Use this source order:
1. authoritative public URL
2. checked-in local proof in `.sources/`
3. vendored dependency proof in `.dependency-references/`
4. an explicit `Arbitrary` note when there is no external source

If a dependency reference is vendored, include a README that records the dependency version, why the reference was kept, and when to re-check it.

## Example

```typescript
/**
 * Optical power or vergence in diopters (`1 / meter`).
 *
 * @see https://webeye.ophth.uiowa.edu/eyeforum/video/Refraction/Intro-Optics-Refract-Errors/index.htm
 * @see https://www.nist.gov/pml/owm/si-units-length
 */
export type Diopters = number;

/**
 * Standard inch-to-meter conversion factor used by the blur-to-pixel equation.
 *
 * @see https://www.nist.gov/pml/owm/si-units-length
 * @see ./.sources/blur-to-pixel-derivation.md
 */
export const METERS_PER_INCH = 0.0254;

/**
 * Telemetry flush interval.
 *
 * Chosen to batch writes without delaying user-visible traces.
 *
 * @see ./docs/telemetry-flush-interval.md
 */
export const TELEMETRY_FLUSH_INTERVAL_MS = 30_000;
```

Example implements: [JSDoc with First-Party Sources](jsdoc-with-first-party-sources.md), [Comments Say Why, Not What](../references/comments-say-why-not-what.md), [No Magic Values](no-magic-values.md).
