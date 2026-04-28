---
example:
  primary: delete-shape-churn
  format: code
  implements:
    - delete-shape-churn
    - pass-values-across-boundaries
    - split-by-stable-seam
---
# Delete Shape Churn

**Rule:** Delete helpers and types that only rename, reshape, or forward the same data without introducing a new invariant, boundary, or lifecycle guarantee.

See also: [Pass Values Across Boundaries](pass-values-across-boundaries.md) and [Split By Stable Seam](split-by-stable-seam.md).

## Why agents get this wrong

Agents are rewarded for local neatness. They see a request object, then create `Input`, `Context`, `Params`, or `State` wrappers so each step looks tidy in isolation. TypeScript makes this cheap, so the code accumulates extra shapes and tiny helpers that feel organized while adding no real design value.

## What to do instead

Keep one canonical internal shape inside a subsystem unless a new shape earns its keep.

This rule is about redundant data-shape hops. If the extra layer is a call wrapper around a real API, use [Delete Pass-Through Wrappers](delete-pass-through-wrappers.md). If the change should have landed in the owning module instead of a sibling helper, use [Edit Real Owners](edit-real-owners.md).

A new hop is justified only if it:
- validates untrusted input
- enforces a domain invariant
- changes ownership across a real subsystem boundary
- performs an irreversible transformation
- guarantees lifecycle or cleanup behavior

If none of those become true, the extra type or helper is just motion. Inline it, delete it, and keep the code closer to the real work.

Ask this in review: what new fact becomes true after this function runs? If the answer is "none," delete the layer.

## Example

```typescript
type UpstreamTarget = {
  tenantId: string;
  userId: string;
  upstreamServerId: string;
};

function createProvider(input: {
  target: UpstreamTarget;
  redirectUri: string;
}) {
  return new UpstreamOAuthProvider(input);
}
```

Example implements: [Delete Shape Churn](delete-shape-churn.md), [Pass Values Across Boundaries](pass-values-across-boundaries.md), [Split By Stable Seam](split-by-stable-seam.md).
## The smell

If a feature has `buildXContext`, `buildXState`, and `toXInput` but all three carry the same fields, the subsystem is lying about its complexity.
