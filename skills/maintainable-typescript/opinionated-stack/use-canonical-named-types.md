---
example:
  primary: use-canonical-named-types
  format: code
  implements:
    - use-canonical-named-types
    - ssot-or-die
    - use-branded-scalar-types
---
# Use Canonical Named Types, Not Inline Object Shapes

**Rule:** For domain concepts, do not write inline object parameter types. Import the canonical named type or infer it from the source of truth.

See also: [SSOT or Die](../references/ssot-or-die.md), [Comments and JSDoc Must Carry Information](jsdoc-with-first-party-sources.md), and [Use Branded Scalar Types](use-branded-scalar-types.md).

## Why agents get this wrong

Agents work locally. They see a function signature that needs a shape and write `{ foo: string; bar: number }` inline because it's fast and type-checks immediately. They don't stop to ask whether that shape already exists, could be inferred, or carries domain meaning that deserves a name.

This erases vocabulary from the codebase. The next reader sees fields, not a concept. If the canonical type had JSDoc, source links, or usage constraints, all of that is lost. Now the same shape exists twice and will drift.

## What to do instead

Before writing an inline object type:

1. Look for an existing named type in the domain package/module
2. If the shape comes from a schema, infer it from that schema
3. If it's a real domain concept used in more than one place, give it a name and colocate it with that domain
4. Use an inline object shape only when it is tiny, truly local, and has no meaning outside that one function

This is adjacent to the branded-scalar problem, not the same problem. Branded scalars protect non-interchangeable primitives. This file is about naming and source ownership for object shapes.

## Example

Shared types package

```typescript
import { z } from 'zod';

/**
 * Installation domain contracts live together because they describe one aggregate.
 */
export const installationIdSchema = z.string().min(1).brand<'InstallationId'>();

export const installationSchema = z.object({
  installationId: installationIdSchema,
  repositoryName: z.string().min(1),
});

export const createInstallationInputSchema = installationSchema.pick({
  installationId: true,
  repositoryName: true,
});

export type Installation = z.infer<typeof installationSchema>;
export type CreateInstallationInput = z.infer<typeof createInstallationInputSchema>;
```

Feature module

```typescript
import type { CreateInstallationInput } from '@repo/shared-types/installations/installation';
import { saveInstallation } from '@repo/db/installations/save-installation';

export function createInstallation(input: CreateInstallationInput) {
  return saveInstallation(input);
}
```

Example implements: [Use Canonical Named Types, Not Inline Object Shapes](use-canonical-named-types.md), [SSOT or Die](../references/ssot-or-die.md), [Use Branded Scalar Types](use-branded-scalar-types.md).
## The test

If a function parameter is an inline object type, ask:

- Does this shape already exist somewhere else?
- Would a type name make the code easier to understand?
- Am I throwing away JSDoc or source references by writing it inline?

If the answer to any of those is yes, stop and use the canonical named type.
