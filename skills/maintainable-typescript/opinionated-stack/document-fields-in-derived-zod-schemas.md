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

**Rule:** Put field descriptions and examples on the derived Zod schemas that feed oRPC and OpenAPI. Drizzle owns structure and constraints; the contract schema owns semantic API documentation.

See also: [Design OpenAPI for Inference](design-openapi-for-inference.md), [Use Canonical Named Types, Not Inline Object Shapes](use-canonical-named-types.md), and [SSOT or Die](../references/ssot-or-die.md).

## Why agents get this wrong

Agents see the database schema first and assume it should also own the API documentation. They try to put every semantic definition on Drizzle columns, or they give up and write the missing descriptions manually in OpenAPI prose later.

That is the wrong split for this stack.

Drizzle is excellent at owning relational facts:

- column names
- nullability
- defaults
- enum domains
- indexes and constraints

But the OpenAPI generator does not read your intent from the database layer alone. The contract layer is where field semantics actually matter to clients:

- what the field means
- how it is represented over the wire
- examples
- endpoint-specific output shape

If you push that documentation into sidecar prose instead of the contract schema, you create a second source of truth.

## What to do instead

Keep the ownership split explicit:

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

Practical rule:

1. Define the table in Drizzle.
2. Derive the schema with `createSelectSchema`, `createInsertSchema`, or `createUpdateSchema`.
3. Add `.describe(...)` and examples in the `drizzle-zod` field callbacks or on the derived schema.
4. Reuse that documented schema in oRPC `.input(...)` and `.output(...)`.
5. Do not hand-write the same field explanations again in route prose unless the endpoint itself adds extra context.

If your OpenAPI tooling expects an extended Zod instance, use `createSchemaFactory({ zodInstance: ... })` and attach metadata there. The key point is the same: document the field where the contract is derived, not in a parallel documentation layer.

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

Example implements: [Document Fields in Derived Zod Schemas](document-fields-in-derived-zod-schemas.md), [Design OpenAPI for Inference](design-openapi-for-inference.md), [SSOT or Die](../references/ssot-or-die.md).

## The test

Ask:

- Is this field description attached to the schema the API contract actually uses?
- If the field meaning changes, will the OpenAPI spec update without touching sidecar docs?
- Am I trying to make the Drizzle layer own API semantics that really belong to the contract layer?
- Did I derive the schema first and then enrich it, instead of hand-writing a duplicate object schema?

If the answer to those questions is no, the semantic contract is in the wrong place.
