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

**Rule:** Give every cache a named owner and explicit invalidation triggers. Remove caches without an invalidation owner.

See also: [SSOT or Die](../abstractions/ssot-or-die.md), [Naming Is Navigation](../foundations/naming-is-navigation.md), and [Bounded Behavior](../foundations/bounded-behavior.md).

## Why agents get this wrong

Cache reads without write invalidation leave stale values. Readers need to know who clears the cache and which changes trigger it.

## What to do instead

Make the cache owner, invalidating state changes, and invalidation calls visible in code. The write path must trigger invalidation. Name the cache so its owner is easy to find.

If ownership is unclear, establish whether the cache is safe to delete and remove it when safe.

## Example

Cache module

```typescript
import type { InstallationId } from '@repo/contracts/installations/installation';
import type { RepositorySummary } from '@repo/contracts/github/repository-summary';

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
import type { InstallationId } from '@repo/contracts/installations/installation';
import { invalidateInstallationRepositoriesCache } from '@/features/installations/installation-repositories-cache';
import { replaceInstallationRepositories } from '@/features/installations/replace-installation-repositories';

export async function syncInstallationRepositories(installationId: InstallationId) {
  await replaceInstallationRepositories(installationId);
  invalidateInstallationRepositoriesCache(installationId);
}
```

Example implements: [Assign Cache Invalidation Owners](./assign-cache-invalidation-owners.md), [SSOT or Die](../abstractions/ssot-or-die.md), [Naming Is Navigation](../foundations/naming-is-navigation.md), [Bounded Behavior](../foundations/bounded-behavior.md).
