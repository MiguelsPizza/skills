---
example:
  primary: use-mature-dependencies-dont-roll-your-own
  format: code
  implements:
    - use-mature-dependencies-dont-roll-your-own
    - no-premature-abstractions
    - bounded-behavior
---
# Use Mature Dependencies, Don't Roll Your Own

**Rule:** Use mature, documented, widely adopted dependencies with strong TypeScript support for commodity infrastructure. If no suitable dependency is known and approved, keep the implementation local and minimal.

## Why agents get this wrong

A small local HTTP client, retry helper, validator, or queue makes the repo responsible for infrastructure already maintained elsewhere. Installing an obscure package with weak docs, uncertain maintenance, or poor TypeScript support creates a similar maintenance burden.

## What to do instead

When the problem is commodity infrastructure:

1. Reuse the repo's existing library for the concern.
2. Otherwise, choose a stable, mature, documented dependency that contributors and agents can reliably understand.
3. Require strong TypeScript types and inference. Repeated casts, wrappers, or manual type repair indicate a poor fit.
4. If no mature dependency is known and approved, write the smallest local implementation for the immediate need.

In startup repos, spend custom code on product behavior.

## Good candidates for dependencies

- HTTP clients
- schema validation
- result/error utilities
- retry/backoff
- date/time handling
- form state
- command parsing
- markdown parsing

## Example

```typescript
import pRetry from 'p-retry';
import type { GitHubInstallation } from '@repo/github-client/installation';
import { MAX_GITHUB_FETCH_ATTEMPTS } from '@repo/github-client/github-retry-policy';
import type { InstallationId } from '@repo/contracts/installations/installation';
import { githubClient } from '@/lib/github-client';

export async function fetchInstallation(
  installationId: InstallationId,
): Promise<GitHubInstallation> {
  return await pRetry(() => githubClient.getInstallation(installationId), {
    retries: MAX_GITHUB_FETCH_ATTEMPTS,
  });
}
```

Example implements: [Use Mature Dependencies, Don't Roll Your Own](./use-mature-dependencies-dont-roll-your-own.md), [No Premature Abstractions](../abstractions/no-premature-abstractions.md), [Bounded Behavior](../foundations/bounded-behavior.md).
