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

**Rule:** Every piece of knowledge should have a single, authoritative source. Types, constants, schemas — define them once, derive everything else.

## Why agents get this wrong

Agents work in context windows. They see the file they're editing, not the whole codebase. When they need a type, they define it locally. When they need a constant, they inline the value. When they need a schema, they write it by hand. This creates copies that drift from each other over time — the same concept defined slightly differently in three places.

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
Both chains follow the same principle: define once at the source, derive everything else. Never hand-write a type that can be inferred. Never duplicate a constant that can be imported. Never define a validation schema that can be derived from the database schema. That rule is broader than schemas: derive unions, option lists, route search contracts, and UI variants from canonical values or schemas instead of declaring parallel arrays, string unions, and lookup objects by hand.

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

Example implements: [SSOT or Die](ssot-or-die.md), [Use Canonical Named Types, Not Inline Object Shapes](../opinionated-stack/use-canonical-named-types.md), [Errors Are Schema, Not Strings](../opinionated-stack/errors-are-schema.md).
## The test

If changing a business rule requires editing more than one file (excluding tests), you have a SSOT violation.
