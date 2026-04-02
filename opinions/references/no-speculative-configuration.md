---
example:
  primary: no-speculative-configuration
  format: code
  implements:
    - no-speculative-configuration
    - no-premature-abstractions
    - maintainability-equals-correctness
---
# No Speculative Configuration

**Rule:** Don't add feature flags or configuration for things that aren't configurable. Build for what exists. Refactor when the second case actually arrives.

See also: [No Premature Abstractions](no-premature-abstractions.md).

## Why agents get this wrong

Agents anticipate future requirements. If you ask them to add an LLM call, they'll build a provider abstraction. If you ask them to add a database query, they'll create a repository pattern with an interface. They design for plug-and-play extensibility that nobody asked for and that may never be needed.

## What to do instead

Hardcode it. If there's one LLM provider, call it directly. If there's one database, query it directly. If there's one notification channel, send to it directly. When the second provider/database/channel actually arrives, refactoring to an abstraction takes an hour and you'll know exactly what the abstraction needs to support — because you'll have two concrete cases.

## Example

Owner constant

```typescript
export const PRIMARY_COMPLETION_MODEL = 'claude-sonnet-4-20250514';
```

Feature usage

```typescript
import { PRIMARY_COMPLETION_MODEL } from '@repo/ai/primary-completion-model';
import { anthropic } from '@/lib/anthropic';

export async function complete(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: PRIMARY_COMPLETION_MODEL,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content[0].text;
}
```

Example implements: [No Speculative Configuration](no-speculative-configuration.md), [No Premature Abstractions](no-premature-abstractions.md), [Maintainability Equals Correctness](maintainability-equals-correctness.md).
## Configuration that IS warranted

- Values that differ between environments (URLs, secrets, feature flags for gradual rollout)
- Values that users actually configure (thresholds, limits, preferences)
- Values that change without code changes (admin toggles, A/B tests)

If it's the same everywhere and only you can change it, it's not configuration — it's a constant.
