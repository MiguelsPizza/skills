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

**Rule:** Use canonical named or schema-inferred types for domain objects. Reserve inline object parameter types for small, local shapes.

See also: [SSOT or Die](../doctrine/abstractions/ssot-or-die.md), [Comments and JSDoc Must Carry Information](./jsdoc-with-first-party-sources.md), and [Use Branded Scalar Types](./use-branded-scalar-types.md).

## Why agents get this wrong

Inline object types duplicate domain definitions and lose their names, documentation, source links, and usage constraints.

## What to do instead

Before writing an inline object parameter type:

1. Look for a named type in the owning domain module or package.
2. Infer the type from its schema when one exists.
3. Name shared domain concepts and colocate them with their owner.
4. Keep a shape inline only when it is small, used by one function, and has no wider domain meaning.

Use the canonical type whenever a shape already exists, its name clarifies the code, or it carries documentation and source references.

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
import type { CreateInstallationInput } from '@repo/contracts/installations/installation';
import { saveInstallation } from '@repo/db/installations/save-installation';
import { enqueueInitialInstallationSync } from '@/installations/enqueue-initial-installation-sync';

export async function createInstallation(input: CreateInstallationInput) {
  const installation = await saveInstallation(input);
  await enqueueInitialInstallationSync({ installationId: installation.installationId });
  return installation;
}
```

Example implements: [Use Canonical Named Types, Not Inline Object Shapes](./use-canonical-named-types.md), [SSOT or Die](../doctrine/abstractions/ssot-or-die.md), [Use Branded Scalar Types](./use-branded-scalar-types.md).
