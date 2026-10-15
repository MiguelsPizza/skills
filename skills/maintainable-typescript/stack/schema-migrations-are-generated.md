---
example:
  primary: schema-migrations-are-generated
  format: workflow
  implements:
    - schema-migrations-are-generated
    - ssot-or-die
    - stack-overview
---
# Schema Migrations Are Generated

**Rule:** Edit the Drizzle schema, generate the migration, review it, and apply it without editing the generated SQL.

See also: [SSOT or Die](../doctrine/abstractions/ssot-or-die.md) and [Opinionated Stack](./stack-overview.md).

## Why agents get this wrong

Hand-written SQL can drift from the Drizzle schema and obscure how a migration was produced.

## What to do instead

Edit the Drizzle schema first, then run:

```bash
vp dlx drizzle-kit generate
vp dlx drizzle-kit migrate
```

Review the generated SQL without editing it. Additive changes are usually safe; renames, type changes, and drops require an explicit rollout plan.

## Example

```text
1. Edit packages/db/src/schema/installations.ts to add the new column
2. Run vp dlx drizzle-kit generate
3. Review the generated apps/main-app/migrations/00xx_add_installation_repo_count.sql file
4. Apply the generated migration without hand-editing the SQL
```

Example implements: [Schema Migrations Are Generated](./schema-migrations-are-generated.md), [SSOT or Die](../doctrine/abstractions/ssot-or-die.md), [Opinionated Stack](./stack-overview.md).
