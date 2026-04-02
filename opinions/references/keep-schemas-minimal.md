---
example:
  primary: keep-schemas-minimal
  format: code
  implements:
    - keep-schemas-minimal
    - no-speculative-configuration
    - ssot-or-die
---
# Keep Schemas Minimal

**Rule:** When creating or changing schemas, add only the fields the current feature needs. Do not persist hypothetical future requirements.

See also: [No Speculative Configuration](no-speculative-configuration.md), [SSOT or Die](ssot-or-die.md), and [Maintainability Equals Correctness](maintainability-equals-correctness.md).

## Why agents get this wrong

Agents over-design schemas immediately. They add `status`, `metadata`, optional foreign keys, future-facing timestamps, and enum states because they assume a real app will need them later. That is speculative configuration at the data-model layer.

This is worse than speculative code. Schema fields are sticky. Once persisted, they show up in queries, contracts, forms, seeds, migrations, and examples. The next agent sees them and assumes they matter.

## What to do instead

Start with the minimum shape that supports current behavior.

- add only the columns or fields the current feature reads or writes
- avoid speculative metadata blobs, flags, optional relations, and enum states
- prefer a later additive migration over carrying unused structure now
- treat every persisted field as long-term ownership cost

This matters most for database tables, where removal is expensive. Apply the same discipline to shared contract schemas when the fields will spread across multiple packages or APIs.

## Example

Canonical owner

```typescript
import { text } from 'drizzle-orm/sqlite-core';

export const installationIdColumn = text('installation_id').notNull();
```

Minimal first pass

```typescript
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { installationIdColumn } from '@repo/db/schema/installation-id-column';

export const reviewRuns = sqliteTable('review_runs', {
  id: text('id').primaryKey(),
  installationId: installationIdColumn,
  pullRequestNumber: integer('pull_request_number').notNull(),
});
```

Not this

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

Example implements: [Keep Schemas Minimal](keep-schemas-minimal.md), [No Speculative Configuration](no-speculative-configuration.md), [SSOT or Die](ssot-or-die.md).

## The test

For each new field, ask:

- does current behavior read or write this?
- is this driven by a real requirement or an imagined future?
- will this field spread into contracts, queries, and UI code just because it exists?

If the justification is "we will probably need it later," do not add it yet.
