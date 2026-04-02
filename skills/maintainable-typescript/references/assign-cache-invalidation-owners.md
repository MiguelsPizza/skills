---
example:
  primary: assign-cache-invalidation-owners
  format: code
  implements:
    - assign-cache-invalidation-owners
    - ssot-or-die
    - naming-is-navigation
    - bounded-behavior
---
# Assign Cache Invalidation Owners

**Rule:** Every cache must have a named owner and explicit invalidation triggers. If nobody owns invalidation, the cache should not exist.

See also: [SSOT or Die](ssot-or-die.md), [Naming Is Navigation](naming-is-navigation.md), and [Bounded Behavior](bounded-behavior.md).

## Why agents get this wrong

Agents add caches as local optimizations. They memoize a fetch, drop a key into KV, or add a module-level map, then stop once the read path is fast. The invalidation story stays implicit.

That creates hidden state. A future editor can see the cache read, but not who clears it, when it is cleared, or whether it is safe to trust. A cache with no visible invalidation owner becomes permanent maintenance drag.

## What to do instead

Every cache must answer four questions in code:

- who owns this cache
- what writes or state changes invalidate it
- where invalidation is triggered
- whether the cache can be deleted if ownership is unclear

Do not treat caches as silent shared state. The write side must own the invalidation path, and the cache name should make that ownership easy to find.

## Example

Cache module

```typescript
import type { InstallationId } from '@repo/shared-types/installations/installation';
import type { RepositorySummary } from '@repo/shared-types/github/repository-summary';

const installationRepositoriesCache = new Map<InstallationId, RepositorySummary[]>();

export function loadCachedInstallationRepositories(installationId: InstallationId) {
  return installationRepositoriesCache.get(installationId);
}

export function storeCachedInstallationRepositories(
  installationId: InstallationId,
  repositories: RepositorySummary[],
) {
  installationRepositoriesCache.set(installationId, repositories);
}

export function invalidateInstallationRepositoriesCache(installationId: InstallationId) {
  installationRepositoriesCache.delete(installationId);
}
```

Write path

```typescript
import type { InstallationId } from '@repo/shared-types/installations/installation';
import { invalidateInstallationRepositoriesCache } from '@/features/installations/installation-repositories-cache';
import { replaceInstallationRepositories } from '@/features/installations/replace-installation-repositories';

export async function syncInstallationRepositories(installationId: InstallationId) {
  await replaceInstallationRepositories(installationId);
  invalidateInstallationRepositoriesCache(installationId);
}
```

Example implements: [Assign Cache Invalidation Owners](assign-cache-invalidation-owners.md), [SSOT or Die](ssot-or-die.md), [Naming Is Navigation](naming-is-navigation.md), [Bounded Behavior](bounded-behavior.md).

## The test

Ask:

- can a new editor find the invalidation owner by search alone?
- does the write path invalidate the cache in the same change?
- if ownership is unclear, is the cache safe to delete?

If those answers are not obvious from the codebase, the cache is under-specified.
