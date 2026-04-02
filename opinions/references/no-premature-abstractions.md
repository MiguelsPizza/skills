---
example:
  primary: no-premature-abstractions
  format: code
  implements:
    - no-premature-abstractions
    - no-speculative-configuration
    - monorepo-package-boundaries
---
# No Premature Abstractions

**Rule:** Three similar lines of code is better than a premature `createHelper()`. Abstractions should be extracted from repeated patterns, not invented speculatively.

See also: [No Speculative Configuration](no-speculative-configuration.md).

## Why agents get this wrong

Agents are trained on codebases that value DRY (Don't Repeat Yourself) as a near-absolute rule. When they see two similar blocks of code, they immediately extract a shared function. When they write a new function, they add `options` parameters for flexibility that nobody asked for. This produces abstractions that couple unrelated code paths and make future changes harder, not easier.

## What to do instead

Wait for the third use case. Two similar things might just be two similar things. When you do extract, the right abstraction will be obvious because you'll have three concrete examples to generalize from.

Signs you're abstracting too early:
- The helper has one caller
- The options object has one or two boolean flags
- You're writing `if (type === 'a') { ... } else { ... }` inside the "shared" function
- The abstraction name is generic (`handleThing`, `processData`, `createHelper`)

## Example

```typescript
import { createUserInputSchema } from '@repo/shared-types/users/user';
import { publicProcedure } from '../orpc';
import { createUser } from '@/features/users/create-user';

export const createUserProcedure = publicProcedure
  .input(createUserInputSchema)
  .handler(async ({ input }) => {
    return await createUser(input);
  });
```

Example implements: [No Premature Abstractions](no-premature-abstractions.md), [No Speculative Configuration](no-speculative-configuration.md), [Monorepo Package Boundaries](monorepo-package-boundaries.md).
## The rule of three

1. First time — just write it
2. Second time — notice the similarity, but still just write it
3. Third time — now extract, because you have three concrete examples of what the abstraction needs to do
