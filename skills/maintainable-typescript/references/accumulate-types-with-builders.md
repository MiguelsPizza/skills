---
example:
  primary: accumulate-types-with-builders
  format: code
  implements:
    - accumulate-types-with-builders
    - boundaries-validate-internals-trust
    - no-premature-abstractions
---
# Accumulate Types With Builders

**Rule:** When an API is configured in stages and each stage adds guarantees, model it as an immutable builder that returns a more specific type after each step.

See also: [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md) and [No Premature Abstractions](no-premature-abstractions.md).

## Why agents get this wrong

Agents do not usually invent builders on their own. They usually start with one big function, an options bag, and a switch statement. The problem starts when a repo or author already leans object-oriented: agents copy that local style aggressively and turn it into mutable `FooBuilder` classes with setters for every field. Both patterns hide which steps are required, which guarantees have been added, and what can happen next.

## What to do instead

Use a builder when the type should change as the configuration becomes more complete. Each step should do one thing:
- add one capability or invariant
- return a new builder with more precise types
- end with a terminal method such as `query()`, `build()`, or `run()`

A good TypeScript builder is monotonic: later steps add information, they do not reopen earlier uncertainty. If the next step depends on the previous one, encode that in the type instead of documenting it in prose.

## Example

```typescript
export const getUser = publicProcedure
  .input(getUserInputSchema)
  .use(requireAuthenticatedUser)
  .use(loadInstallationFromInput)
  .output(userSchema)
  .query(({ ctx, input }) => {
    return fetchUser({
      installationId: ctx.installation.id,
      userId: input.userId,
    });
  });
```

Example implements: [Accumulate Types With Builders](accumulate-types-with-builders.md), [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md), [No Premature Abstractions](no-premature-abstractions.md).
## The test

If your API accepts a giant options object and the valid combinations live in comments, it wants a builder.
