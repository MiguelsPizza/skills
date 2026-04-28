---
example:
  primary: no-premature-abstractions
  format: code
  implements:
    - no-premature-abstractions
    - maintainability-equals-correctness
    - monorepo-package-boundaries
---
# No Premature Abstractions

**Rule:** Three similar lines of code is better than a premature `createHelper()`. Abstractions and configuration should be extracted from real pressure, not invented speculatively.

See also: [Maintainability Equals Correctness](../foundations/maintainability-equals-correctness.md) and [Monorepo Package Boundaries](../packages/monorepo-package-boundaries.md).

## Why agents get this wrong

Agents are trained on codebases that value DRY (Don't Repeat Yourself) as a near-absolute rule. When they see two similar blocks of code, they immediately extract a shared function. When they write a new function, they add `options` parameters, feature flags, provider interfaces, and configuration hooks for flexibility that nobody asked for.

This produces abstractions that couple unrelated code paths and make future changes harder, not easier. Configuration is just another form of premature abstraction when only one value, provider, or behavior exists.

## What to do instead

Wait for the third use case. Two similar things might just be two similar things. When you do extract, the right abstraction will be obvious because you'll have three concrete examples to generalize from.

Signs you're abstracting too early:
- The helper has one caller
- The options object has one or two boolean flags
- You're writing `if (type === 'a') { ... } else { ... }` inside the "shared" function
- The abstraction name is generic (`handleThing`, `processData`, `createHelper`)
- The configuration value is the same in every environment
- The provider interface has one implementation
- The feature flag cannot be changed by users, operators, rollout policy, or environment

## Example

```typescript
import { createUserInputSchema } from '@repo/contracts/users/user';
import { publicProcedure } from '../orpc';
import { createUser } from '@/features/users/create-user';

export const createUserProcedure = publicProcedure
  .input(createUserInputSchema)
  .handler(async ({ input }) => {
    return await createUser(input);
  });
```

Example implements: [No Premature Abstractions](./no-premature-abstractions.md), [Maintainability Equals Correctness](../foundations/maintainability-equals-correctness.md), [Monorepo Package Boundaries](../packages/monorepo-package-boundaries.md).

## Configuration that earns its keep

Configuration is warranted when values differ between environments, users actually configure them, operators change them without a deploy, or rollout policy depends on them. If the value is the same everywhere and only code owners can change it, it is a constant.

## The rule of three

1. First time — just write it
2. Second time — notice the similarity, but still just write it
3. Third time — now extract, because you have three concrete examples of what the abstraction needs to do
