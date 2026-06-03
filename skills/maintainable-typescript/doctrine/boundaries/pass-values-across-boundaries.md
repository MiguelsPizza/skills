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

**Rule:** Cross real subsystem boundaries with plain data contracts, not rich service objects or ambient context.

See also: [Boundaries Validate, Internals Trust](./boundaries-validate-internals-trust.md) and [No Type Casts](./no-type-casts.md).

## Why agents get this wrong

Agents thread behavior-bearing objects everywhere because it is locally convenient. They pass `ctx`, repositories, SDK clients, caches, and feature services through the call graph until every function depends on half the application. That makes code hard to test and harder to move.

They also overcorrect. After hearing "pass values," they carve an existing domain object into tiny TypeScript `Pick`, TypeScript `Omit`, `Params`, or `Input` shapes for every helper. That is not a better boundary. It is shape churn inside the same owner.

## What to do instead

At real subsystem boundaries, pass data:
- ids
- validated input objects
- result objects
- tagged unions

Keep behavior inside the owning module. Let the boundary expose a small contract and hide its internal machinery. Apply this to app context, service objects, SDK clients, repositories, caches, and other behavior-bearing objects.

Inside an owned subsystem, prefer the canonical domain object or named input type. Do not create a new projection just because one helper reads fewer fields. A function can accept a larger domain object and use only the fields it needs. A narrower shape earns its keep only when it names a real boundary, invariant, lifecycle, or public contract.

## Example

```typescript
import type { RepositoryInstallation } from '@repo/contracts/installations/installation';
import { saveRepositoryInstallation } from '@repo/db/installations/save-repository-installation';
import { queueRepositorySync } from '@/features/repositories/queue-repository-sync';

type CreateRepositoryInstallationInput = {
  installationId: InstallationId;
  repositoryName: string;
  visibility: 'public' | 'private';
};

export async function createRepositoryInstallation(
  input: CreateRepositoryInstallationInput,
): Promise<RepositoryInstallation> {
  const installation = await saveRepositoryInstallation({
    installationId: input.installationId,
    repositoryName: input.repositoryName,
    visibility: input.visibility,
  });

  const syncMode = chooseInitialSyncMode(installation);
  if (syncMode !== 'skip') {
    await queueRepositorySync({
      installationId: installation.installationId,
      mode: syncMode,
    });
  }

  return installation;
}

function chooseInitialSyncMode(installation: RepositoryInstallation): 'full' | 'metadata' | 'skip' {
  if (installation.archivedAt) {
    return 'skip';
  }

  if (installation.visibility === 'private') {
    return 'full';
  }

  return 'metadata';
}
```

Example implements: [Pass Values Across Boundaries](./pass-values-across-boundaries.md), [Boundaries Validate, Internals Trust](./boundaries-validate-internals-trust.md), [No Type Casts](./no-type-casts.md).
## The test

If moving a function requires dragging five service objects with it, the boundary is carrying behavior instead of data.

If adding one helper requires a new TypeScript `Pick`, TypeScript `Omit`, `Params`, or object-spread projection of an existing domain object, the code is probably inventing a boundary instead of using the owned contract.
