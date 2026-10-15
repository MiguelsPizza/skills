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

Agents pass `ctx`, repositories, SDK clients, and caches through the call graph. Each function inherits dependencies it does not need, making it harder to test or move.

## What to do instead

Pass IDs, validated inputs, results, or tagged unions across subsystem boundaries. Include only the fields the receiver needs. Keep dependencies and behavior inside the module that owns them.

## Example

```typescript
import type { CreateRepositoryInstallationInput } from '@repo/contracts/installations/installation';
import { saveRepositoryInstallation } from '@repo/db/installations/save-repository-installation';
import { enqueueInitialInstallationSync } from '@/installations/enqueue-initial-installation-sync';

export async function createRepositoryInstallation(input: CreateRepositoryInstallationInput) {
  const installation = await saveRepositoryInstallation(input);
  await enqueueInitialInstallationSync({ installationId: installation.installationId });
  return installation;
}
```

Example implements: [Pass Values Across Boundaries](./pass-values-across-boundaries.md), [Boundaries Validate, Internals Trust](./boundaries-validate-internals-trust.md), [No Type Casts](./no-type-casts.md).
