---
example:
  primary: ssot-or-die
  format: code
  implements:
    - ssot-or-die
    - use-canonical-named-types
    - errors-are-schema
---
# SSOT or Die

**Rule:** Define each type, constant, schema, and business rule once. Derive or import every other use.

## Why agents get this wrong

Agents define a local type, constant, or schema without finding its owner. The copies drift as each caller changes independently.

## What to do instead

Follow the derivation chains:

**Data:**
```
@repo/db schema
  → Zod schemas (drizzle-zod)
    → @repo/contracts domain file
      → TypeScript types (z.infer<>)
      → API contracts (oRPC input/output)
        → Client types (auto-generated)
```
**Errors:**
```
Zod error schemas (defined once)
  → typed procedure error contracts
    → OpenAPI spec (auto-generated, with examples)
      → Client error types (auto-generated)
        → MCP tool error descriptions (auto-generated)
```
Infer types, import constants, and derive validation schemas from the database schema. Derive unions, option lists, route search contracts, and UI variants from their canonical values or schemas.

## Example

```typescript
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const installations = sqliteTable('installations', {
  id: text('id').primaryKey(),
  repositoryName: text('repository_name').notNull()
});
```

```typescript
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { installations } from '@repo/db/schema/installations';

export const installationSchema = createSelectSchema(installations);
export const getInstallationInputSchema = installationSchema.pick({ id: true });
export type Installation = z.infer<typeof installationSchema>;

export const installationNotFoundErrorSchema = z.object({
  code: z.literal('installation_not_found'),
  message: z.literal('Installation not found.'),
  installationId: installationSchema.shape.id,
});
```

```typescript
import { eq } from 'drizzle-orm';
import { db } from '@repo/db/client';
import { getInstallationInputSchema, installationSchema } from '@repo/contracts/installations/installation';
import { installations } from '@repo/db/schema/installations';
import { publicProcedure } from '../orpc';

export const getInstallation = publicProcedure
  .input(getInstallationInputSchema)
  .output(installationSchema)
  .handler(async ({ input, errors }) => {
    const installation = await db.query.installations.findFirst({
      where: eq(installations.id, input.id),
    });

    if (!installation) {
      throw errors.NOT_FOUND({
        data: {
          code: 'installation_not_found',
          message: 'Installation not found.',
          installationId: input.id,
        },
      });
    }

    return installation;
  });
```

Example implements: [SSOT or Die](./ssot-or-die.md), [Use Canonical Named Types, Not Inline Object Shapes](../../stack/use-canonical-named-types.md), [Errors Are Schema, Not Strings](../../stack/errors-are-schema.md).
## The test

If changing a business rule requires editing more than one file (excluding tests), you have a SSOT violation.
