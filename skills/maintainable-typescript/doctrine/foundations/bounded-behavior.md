---
example:
  primary: bounded-behavior
  format: code
  implements:
    - bounded-behavior
    - no-magic-values
    - log-at-boundaries-not-everywhere
---
# Bounded Behavior

**Rule:** Every retry has a max. Every queue has a size limit. Every poll has a timeout. Every payload has a cap. Unbounded anything is a production incident waiting to happen.

## Why agents get this wrong

Agents write the happy path well. They add retry logic, polling loops, and queue processing. But they often forget to add bounds — `while (!done)` without a max iteration count, `setTimeout(poll, 1000)` without a deadline, retry logic without backoff or a ceiling.

## What to do instead

Every loop, retry, queue, buffer, or recurring operation needs an explicit bound. Define it as a constant. Make it visible.

## Checklist

- [ ] Retries have `MAX_RETRIES` with exponential backoff
- [ ] Polling has a `TIMEOUT_MS` that stops the loop
- [ ] Queues have a `MAX_QUEUE_SIZE` that applies backpressure
- [ ] Payloads have a `MAX_PAYLOAD_BYTES` that rejects oversized input
- [ ] Batch operations have a `BATCH_SIZE` limit
- [ ] WebSocket reconnection has a max attempts before giving up
- [ ] Recursive functions have a depth limit or are rewritten as iteration

## Example

Owner constants

```typescript
export const MAX_GITHUB_FETCH_ATTEMPTS = 3;
export const INITIAL_RETRY_DELAY_MS = 250;
export const GITHUB_FETCH_TIMEOUT_MS = 5_000;
export const MAX_GITHUB_DIFF_BYTES = 500_000;
```

Feature usage

```typescript
import { getPullRequestDiffInputSchema } from '@repo/contracts/github/get-pull-request-diff';
import {
  INITIAL_RETRY_DELAY_MS,
  GITHUB_FETCH_TIMEOUT_MS,
  MAX_GITHUB_DIFF_BYTES,
  MAX_GITHUB_FETCH_ATTEMPTS,
} from '@repo/github-client/github-retry-policy';
import { buildPullRequestDiffUrl } from '@/lib/github/build-pull-request-diff-url';
import { publicProcedure } from '../orpc';
import { sleep } from '@/lib/sleep';

type PullRequestDiffFetchResult =
  | { status: 'loaded'; diff: string }
  | { status: 'too-large'; maxBytes: number }
  | { status: 'unavailable' };

async function fetchPullRequestDiff(url: string): Promise<PullRequestDiffFetchResult> {
  for (let attempt = 0; attempt < MAX_GITHUB_FETCH_ATTEMPTS; attempt += 1) {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), GITHUB_FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: abortController.signal });

      if (response.ok) {
        const diff = await response.text();
        if (diff.length > MAX_GITHUB_DIFF_BYTES) {
          return { status: 'too-large', maxBytes: MAX_GITHUB_DIFF_BYTES };
        }

        return { status: 'loaded', diff };
      }
    } catch {
      // Network errors and aborts are retried below with the same bounded policy.
    } finally {
      clearTimeout(timeout);
    }

    if (attempt < MAX_GITHUB_FETCH_ATTEMPTS - 1) {
      await sleep(INITIAL_RETRY_DELAY_MS * 2 ** attempt);
    }
  }

  return { status: 'unavailable' };
}

export const getPullRequestDiff = publicProcedure
  .input(getPullRequestDiffInputSchema)
  .handler(async ({ input, errors }) => {
    const result = await fetchPullRequestDiff(
      buildPullRequestDiffUrl(input.pullRequestNumber),
    );

    if (result.status === 'too-large') {
      throw errors.PAYLOAD_TOO_LARGE({
        data: {
          code: 'pull_request_diff_too_large',
          message: 'Pull request diff is too large to load.',
          maxBytes: result.maxBytes,
        },
      });
    }

    if (result.status === 'unavailable') {
      throw errors.BAD_GATEWAY({
        data: {
          code: 'pull_request_diff_unavailable',
          message: 'Unable to load the pull request diff.',
          attempts: MAX_GITHUB_FETCH_ATTEMPTS,
          pullRequestNumber: input.pullRequestNumber,
        },
      });
    }

    return { diff: result.diff };
  });
```

Example implements: [Bounded Behavior](./bounded-behavior.md), [No Magic Values](../../stack/no-magic-values.md), [Log at Boundaries, Not Everywhere](../boundaries/log-at-boundaries-not-everywhere.md).
## Why this is an agent-specific problem

Humans intuit that a `while (true)` is dangerous. Agents don't have that instinct — they write structurally correct code that can run forever under the wrong conditions. Explicit bounds are the safeguard.
