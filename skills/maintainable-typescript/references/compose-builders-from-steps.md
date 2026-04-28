---
example:
  primary: compose-builders-from-steps
  format: code
  implements:
    - compose-builders-from-steps
    - no-premature-abstractions
    - your-pattern-will-be-copied
---
# Compose Builders From Steps

**Rule:** Extract reusable builder steps, not branchy helpers with mode flags.

See also: [Accumulate Types With Builders](accumulate-types-with-builders.md), [No Premature Abstractions](no-premature-abstractions.md), and [Your Pattern Will Be Copied](your-pattern-will-be-copied.md).

## Why agents get this wrong

Agents rarely choose a clean step-based builder by default. They usually see repetition and extract a `createThing({ type, authenticated, cache, log })` helper. If the surrounding code already uses builders, they copy that too, but they still keep the same branchy design inside. The result is technically shared code, but not a real abstraction. It is a switch statement wearing a function name.

## What to do instead

Factor reusable behavior into named steps that can be composed onto a base builder:
- `requireAuthenticatedUser`
- `rateLimitWrites`
- `withCachedRead`
- `emitAuditEvent`

Then build concrete operations by chaining only the steps they need. This keeps reuse local and visible. It also makes tests smaller because each step can be tested once and every composed chain can be tested at the boundary.

If a builder step needs a `mode` enum or multiple boolean flags to decide what to do, split it. A builder step should have one job.

## Example

```typescript
const protectedProcedure = publicProcedure.use(requireAuthenticatedUser);

const auditedWriteProcedure = protectedProcedure
  .use(rateLimitWrites)
  .use(emitAuditEvent);

export const updateRepository = auditedWriteProcedure
  .input(updateRepositoryInputSchema)
  .mutation(({ ctx, input }) => {
    return saveRepository(ctx.user.id, input);
  });
```

Example implements: [Compose Builders From Steps](compose-builders-from-steps.md), [No Premature Abstractions](no-premature-abstractions.md), [Your Pattern Will Be Copied](your-pattern-will-be-copied.md).
## The smell

If adding one new case means touching the shared helper's `if` ladder, you did not extract a primitive. You extracted a bottleneck.
