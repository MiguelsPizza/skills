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

**Rule:** Do not rebuild commodity infrastructure in application code. Use mature, well-documented, widely adopted dependencies for solved problems. In strict TypeScript repos, weak type support is a quality failure, not a minor drawback. If no such dependency is clearly known and approved, keep the implementation local and minimal.

## Why agents get this wrong

Agents overfit to the current diff. In a new repo, they happily build a tiny homegrown `Result` type, HTTP client, retry helper, validator, logger wrapper, date utility layer, or task queue because it avoids adding a dependency right now.

That is fake simplicity. The repo now owns a worse version of a problem the ecosystem already solved, documented, tested, and maintained. The next agent copies the pattern. Soon every repo has a different fake `axios`, fake `neverthrow`, fake form layer, or fake state library.

The opposite failure also happens. Agents sometimes install random packages with thin ecosystems, weak docs, unclear maintenance, or leaky TypeScript support because the name sounds right. That trades one long-term problem for another.

## What to do instead

When the problem is commodity infrastructure:

1. Use an existing dependency if it is stable, mature, well-documented, and widely adopted
2. Prefer dependencies that are already common enough to be reliably understood by humans and agents
3. If the repo already uses a library for that concern, use the existing library instead of introducing a second one
4. Prefer libraries whose TypeScript types and inference are part of the product quality, not an afterthought
5. If a library forces repeated casts, wrapper layers, or manual type repair during normal use, treat that as a sign the dependency is not a good fit
6. If a mature dependency is not clearly known, do not guess with an obscure package
7. In that case, write the smallest local implementation that solves the immediate need without pretending to be a reusable framework

This is a startup rule. Spend custom code on product differentiation, not on rebuilding generic tooling.

## Good candidates for dependencies

- HTTP clients
- schema validation
- result/error utilities
- retry/backoff
- date/time handling
- form state
- command parsing
- markdown parsing

## Bad reasons to roll your own

- "It is only 40 lines"
- "We might want full control later"
- "I do not want another dependency"
- "The agent can just write a quick version"
- "The types are bad, but we can wrap it"

## Example

```typescript
import pRetry from 'p-retry';
import type { GitHubInstallation } from '@repo/github-client/installation';
import { MAX_GITHUB_FETCH_ATTEMPTS } from '@repo/github-client/github-retry-policy';
import type { InstallationId } from '@repo/shared-types/installations/installation';
import { githubClient } from '@/lib/github-client';

export async function fetchInstallation(
  installationId: InstallationId,
): Promise<GitHubInstallation> {
  return await pRetry(() => githubClient.getInstallation(installationId), {
    retries: MAX_GITHUB_FETCH_ATTEMPTS,
  });
}
```

Example implements: [Use Mature Dependencies, Don't Roll Your Own](use-mature-dependencies-dont-roll-your-own.md), [No Premature Abstractions](no-premature-abstractions.md), [Bounded Behavior](bounded-behavior.md).
## The test

If you are about to write a reusable utility for a problem every repo has, ask:

- Is this already a solved problem with a mature dependency?
- Is the dependency stable enough that humans and agents will understand it?
- Does the dependency have strong TypeScript support and inference in normal usage?
- Will this dependency reduce casts and handwritten type glue instead of causing more of them?
- Am I about to create a second-rate local framework instead of shipping product code?

If the answer is yes, use the dependency. If you cannot confidently name a mature one, do not invent a new abstraction layer around a random package. Keep the code local and narrow.
