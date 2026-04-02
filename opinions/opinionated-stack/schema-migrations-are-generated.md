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

**Rule:** Never hand-write migration SQL. Edit the Drizzle schema, generate the migration, review it, and apply it without editing the generated file.

See also: [SSOT or Die](../references/ssot-or-die.md) and [Opinionated Stack](stack-overview.md).

## Why agents get this wrong

Agents often jump straight to SQL because it feels faster. That breaks the schema derivation chain, makes the migration provenance ambiguous, and invites drift between the Drizzle model and the actual database.

## What to do instead

Use this workflow every time:

```bash
vp dlx drizzle-kit generate
vp dlx drizzle-kit migrate
```

That assumes the Drizzle schema was edited first. Review the generated SQL, but do not hand-edit it afterward.

Schema changes still require human judgment. Additive changes are usually safe. Renames, type changes, and drops need an explicit rollout plan.

## Example

```text
1. Edit packages/db/src/schema/installations.ts to add the new column
2. Run vp dlx drizzle-kit generate
3. Review the generated apps/main-app/migrations/00xx_add_installation_repo_count.sql file
4. Apply the generated migration without hand-editing the SQL
```

Example implements: [Schema Migrations Are Generated](schema-migrations-are-generated.md), [SSOT or Die](../references/ssot-or-die.md), [Opinionated Stack](stack-overview.md).
