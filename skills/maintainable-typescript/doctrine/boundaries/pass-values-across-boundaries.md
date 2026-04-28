---
example:
  primary: pass-values-across-boundaries
  format: code
  implements:
    - pass-values-across-boundaries
    - boundaries-validate-internals-trust
    - no-type-casts
---
# Pass Values Across Boundaries

**Rule:** Cross subsystem boundaries with plain values, not rich service objects or ambient context.

See also: [Boundaries Validate, Internals Trust](./boundaries-validate-internals-trust.md) and [No Type Casts](./no-type-casts.md).

## Why agents get this wrong

Agents thread complex objects everywhere because it is locally convenient. They pass `ctx`, repositories, SDK clients, caches, and feature services through the call graph until every function depends on half the application. That makes code hard to test and harder to move.

## What to do instead

At subsystem boundaries, pass data:
- ids
- validated input objects
- result objects
- tagged unions

Keep behavior inside the owning module. Let the boundary expose a small contract and hide its internal machinery. If a caller only needs three fields, pass those three fields, not the entire application context.

## Example

```typescript
export async function createRepositoryInstallation(input: {
  installationId: InstallationId;
  repositoryName: string;
}): Promise<RepositoryInstallation> {
  return await saveRepositoryInstallation(input);
}
```

Example implements: [Pass Values Across Boundaries](./pass-values-across-boundaries.md), [Boundaries Validate, Internals Trust](./boundaries-validate-internals-trust.md), [No Type Casts](./no-type-casts.md).
## The test

If moving a function requires dragging five service objects with it, the boundary is carrying behavior instead of data.
