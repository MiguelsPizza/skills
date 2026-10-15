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

**Rule:** Extract abstractions and configuration from real use cases. Wait for three concrete uses before sharing similar code.

See also: [Maintainability Equals Correctness](../foundations/maintainability-equals-correctness.md) and [Monorepo Package Boundaries](../packages/monorepo-package-boundaries.md).

## Why agents get this wrong

Agents extract similar code too soon and add options, flags, or provider interfaces without a second behavior to support. The abstraction couples callers around guesses about future needs.

## What to do instead

Write the first two uses directly. At the third use, extract the shared behavior supported by all three examples.

Check for premature abstraction when:

- a helper has one caller
- boolean options or type branches select caller-specific behavior
- a generic name hides the responsibility
- a configuration value is identical in every environment
- a provider interface has one implementation
- a feature flag cannot be changed by users, operators, rollout policy, or environment

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
