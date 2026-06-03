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

See also: [SSOT or Die](../doctrine/abstractions/ssot-or-die.md), [Comments and JSDoc Must Carry Information](./jsdoc-with-first-party-sources.md), and [Use Branded Scalar Types](./use-branded-scalar-types.md).

## Why agents get this wrong

Agents work locally. They see a function signature that needs a shape and write `{ foo: string; bar: number }` inline because it's fast and type-checks immediately. They don't stop to ask whether that shape already exists, could be inferred, or carries domain meaning that deserves a name.

This erases vocabulary from the codebase. The next reader sees fields, not a concept. If the canonical type had JSDoc, source links, or usage constraints, all of that is lost. Now the same shape exists twice and will drift.

The same mistake shows up as TypeScript `Pick`, TypeScript `Omit`, and one-off `Params` types. Those feel safer than passing the full domain object, but inside an owned subsystem they usually hide the real concept and create more shapes to remember.

## What to do instead

Before writing an inline object type:

1. Look for an existing named type in the domain package/module
2. If the shape comes from a schema, infer it from that schema
3. If it's a real domain concept used in more than one place, give it a name and colocate it with that domain
4. Use an inline object shape only when it is tiny, truly local, and has no meaning outside that one function

Use schema projection for real contract schemas, not as a reflex for private helper parameters. `createSelectSchema`, `createInsertSchema`, `createUpdateSchema`, and Zod `.pick()`/`.omit()` are fine when they define a real API, insert, update, or select contract. If a helper belongs to the same owner as the canonical object, pass the canonical object or the existing named input type unless a narrower contract has its own invariant or boundary.

It is fine when a function does not read every field on a canonical object. The maintenance cost is not the unused fields; it is the reader having to compare several nearly identical shapes to learn whether they mean different things.

This is adjacent to the branded-scalar problem, not the same problem. Branded scalars protect non-interchangeable primitives. This file is about naming and source ownership for object shapes.

## Example

Shared types package

```typescript
import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { installations } from '@repo/db/schema/installations';

/**
 * Installation domain contracts live together because they describe one aggregate.
 */
export const installationIdSchema = z.string().min(1).brand<'InstallationId'>();

export const installationSchema = createSelectSchema(installations, {
  installationId: installationIdSchema,
});

// Public contract schema for a creation boundary.
export const createInstallationInputSchema = createInsertSchema(installations, {
  installationId: installationIdSchema,
}).pick({
  installationId: true,
  repositoryName: true,
});

export type Installation = z.infer<typeof installationSchema>;
export type CreateInstallationInput = z.infer<typeof createInstallationInputSchema>;
```

Feature module

```typescript
import type { CreateInstallationInput } from '@repo/contracts/installations/installation';
import { findInstallationByRepository } from '@repo/db/installations/find-installation-by-repository';
import { saveInstallation } from '@repo/db/installations/save-installation';
import { emitInstallationCreated } from '@/features/installations/emit-installation-created';

export async function createInstallation(input: CreateInstallationInput) {
  const existingInstallation = await findInstallationByRepository(input.repositoryName);

  if (existingInstallation) {
    throw new Error(`Repository already connected: ${input.repositoryName}`);
  }

  const installation = await saveInstallation({
    installationId: input.installationId,
    repositoryName: input.repositoryName,
  });

  await emitInstallationCreated({
    installationId: installation.installationId,
    repositoryName: installation.repositoryName,
  });

  return installation;
}
```

Example implements: [Use Canonical Named Types, Not Inline Object Shapes](./use-canonical-named-types.md), [SSOT or Die](../doctrine/abstractions/ssot-or-die.md), [Use Branded Scalar Types](./use-branded-scalar-types.md).
## The test

If a function parameter is an inline object type, ask:

- Does this shape already exist somewhere else?
- Would a type name make the code easier to understand?
- Am I throwing away JSDoc or source references by writing it inline?
- Am I using TypeScript `Pick` or TypeScript `Omit` only because this helper happens to read fewer fields?

If the answer to any of those is yes, stop and use the canonical named type.
