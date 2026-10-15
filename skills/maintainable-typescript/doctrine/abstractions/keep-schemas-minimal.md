---
example:
  primary: keep-schemas-minimal
  format: code
  implements:
    - keep-schemas-minimal
    - no-premature-abstractions
    - ssot-or-die
---
# Keep Schemas Minimal

**Rule:** When creating or changing schemas, add only the fields the current feature needs. Do not persist hypothetical future requirements.

See also: [No Premature Abstractions](./no-premature-abstractions.md), [SSOT or Die](./ssot-or-die.md), and [Maintainability Equals Correctness](../foundations/maintainability-equals-correctness.md).

## Why agents get this wrong

Agents add metadata, flags, relations, timestamps, and enum states for imagined future features. Those fields spread into queries, contracts, forms, and migrations, making removal expensive.

## What to do instead

Add only fields that current behavior reads or writes. Add future fields through later migrations when the requirement exists.

Apply this rule to database tables and shared contract schemas. Every persisted or shared field creates a lasting maintenance cost.

## Example

Canonical owner

```typescript
import { text } from 'drizzle-orm/sqlite-core';

export const installationIdColumn = text('installation_id').notNull();
```

Good: fields used by the current feature

```typescript
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { installationIdColumn } from '@repo/db/schema/installation-id-column';

export const reviewRuns = sqliteTable('review_runs', {
  id: text('id').primaryKey(),
  installationId: installationIdColumn,
  pullRequestNumber: integer('pull_request_number').notNull(),
});
```

Bad: speculative fields

```typescript
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { installationIdColumn } from '@repo/db/schema/installation-id-column';

export const reviewRuns = sqliteTable('review_runs', {
  id: text('id').primaryKey(),
  installationId: installationIdColumn,
  pullRequestNumber: integer('pull_request_number').notNull(),
  status: text('status').notNull(),
  archivedAt: integer('archived_at'),
  lastViewedAt: integer('last_viewed_at'),
  metadataJson: text('metadata_json'),
  sourceRepositoryId: text('source_repository_id'),
});
```

Example implements: [Keep Schemas Minimal](./keep-schemas-minimal.md), [No Premature Abstractions](./no-premature-abstractions.md), [SSOT or Die](./ssot-or-die.md).
