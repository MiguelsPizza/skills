---
example:
  primary: document-fields-in-derived-zod-schemas
  format: code
  implements:
    - document-fields-in-derived-zod-schemas
    - design-openapi-for-inference
    - ssot-or-die
references:
  authority:
    - title: Drizzle ORM `drizzle-zod`
      url: https://orm.drizzle.team/docs/zod
    - title: oRPC OpenAPI Specification
      url: https://orpc.dev/docs/openapi/openapi-specification
  supporting: []
---
# Document Fields in Derived Zod Schemas

**Rule:** Put field descriptions and examples on the derived Zod schemas used by oRPC and OpenAPI. Drizzle owns database structure and constraints.

See also: [Design OpenAPI for Inference](./design-openapi-for-inference.md), [Use Canonical Named Types, Not Inline Object Shapes](./use-canonical-named-types.md), and [SSOT or Die](../doctrine/abstractions/ssot-or-die.md).

## Why agents get this wrong

Database columns define relational facts but do not fully describe wire formats, field meaning, examples, or endpoint output. Writing those details in separate docs creates another source to maintain.

## What to do instead

Keep database structure and API documentation in this chain:

```text
Drizzle
  -> structure and constraints

drizzle-zod
  -> derived runtime schema

Zod metadata on the derived schema
  -> semantic field descriptions and examples

oRPC
  -> request/output/error contracts and route metadata

OpenAPI
  -> inferred published spec
```

1. Define the table in Drizzle.
2. Derive the schema with `createSelectSchema`, `createInsertSchema`, or `createUpdateSchema`.
3. Add `.describe(...)` and examples in the `drizzle-zod` field callbacks or on the derived schema.
4. Reuse the documented schema in oRPC `.input(...)` and `.output(...)`.
5. Add route prose only for context specific to that endpoint.

If OpenAPI tooling requires an extended Zod instance, use `createSchemaFactory({ zodInstance: ... })` and attach metadata there. Field documentation must reach OpenAPI through the contract schema.

## Example

Drizzle owner

```typescript
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
});
```

Derived contract schema owner

```typescript
import { createSelectSchema } from 'drizzle-zod';
import { users } from '@repo/db/schema/users';

export const userSchema = createSelectSchema(users, {
  id: (schema) =>
    schema
      .describe('WorkOS user ID for the account.')
      .meta({ examples: ['user_01HXYZABC123'] }),
  email: (schema) =>
    schema
      .describe('Primary email address for the user.')
      .meta({ examples: ['ada@example.com'] }),
  name: (schema) =>
    schema.describe('Display name from WorkOS, if available.'),
  created_at: (schema) =>
    schema.describe('Timestamp when the user record was created.'),
}).describe('Platform user returned by the API.');
```

Procedure

```typescript
import { publicProcedure } from '../orpc';
import { userSchema } from '@repo/contracts/users/user';
import { getUserInputSchema } from '@repo/contracts/users/get-user';

export const getUser = publicProcedure
  .route({
    method: 'GET',
    path: '/users/{id}',
    summary: 'Get user',
    description: 'Return a single platform user by ID.',
    operationId: 'users_get',
    tags: ['Users'],
  })
  .input(getUserInputSchema)
  .output(userSchema)
  .handler(async ({ input }) => {
    return await loadUser(input.id);
  });
```

Example implements: [Document Fields in Derived Zod Schemas](./document-fields-in-derived-zod-schemas.md), [Design OpenAPI for Inference](./design-openapi-for-inference.md), [SSOT or Die](../doctrine/abstractions/ssot-or-die.md).
