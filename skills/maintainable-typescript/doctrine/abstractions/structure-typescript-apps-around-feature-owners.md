---
example:
  primary: structure-typescript-apps-around-feature-owners
  format: text
  implements:
    - structure-typescript-apps-around-feature-owners
    - build-deep-modules-not-shallow-abstractions
    - monorepo-package-boundaries
---
# Structure TypeScript Apps Around Feature Owners

**Rule:** Keep framework entrypoints thin. Put product behavior in feature modules and shared contracts or primitives in packages.

See also: [Build Deep Modules, Not Shallow Abstractions](./build-deep-modules-not-shallow-abstractions.md), [Monorepo Package Boundaries](../packages/monorepo-package-boundaries.md), and [Naming Is Navigation](../foundations/naming-is-navigation.md).

## Why agents get this wrong

Agents spread one feature across controllers, services, repositories, hooks, and jobs without a framework convention connecting them. Readers must search several directories to understand one workflow. Routes and vendor clients also accumulate product rules that belong to a feature.

## What to do instead

Use runtime boundaries at the top and feature owners inside them:

```text
apps/
  web/
    src/
      app/ or routes/          # framework route tree only
      features/                # product UI and browser workflows
      server/                  # web-app server primitives when the framework has them
      test/

  api/
    src/
      routes/                  # HTTP/RPC adapters only
      features/                # product backend behavior
      jobs/                    # queue/cron adapters only
      server/                  # auth, db client, http errors, config, telemetry
      test/

  worker/                      # only when deployed separately
    src/
      scheduled.ts
      queues.ts

packages/
  ui/                          # reusable design-system primitives
  contracts/                   # API schemas, generated clients, shared DTOs
  db/                          # schema, migrations, generated DB types
  integrations/                # reusable vendor clients only
  config/                      # shared tooling presets, if needed
```

If the framework combines web and backend, use one runtime:

```text
apps/web/src/
  app/ or routes/
  features/
  server/
  jobs/
  test/
```

Add `apps/api` or `apps/worker` only for a separate deployable runtime, scaling unit, permission boundary, or build target.

## Route files are adapters

Routes, pages, controllers, and RPC handlers parse transport state and call the feature owner.

```typescript
// apps/api/src/routes/review-runs.ts
export async function postReviewRun(request: Request) {
  const input = await readJson(request);
  const user = await requireSession(request);
  const result = await createReviewRun({ input, user });
  return json(result);
}
```

Put validation policy, permissions, persistence, events, and audit logging in the feature:

```text
apps/api/src/features/review-runs/create-review-run.server.ts
```

Colocate route-only UI, loaders, and small helpers when the framework safely distinguishes them from routes. Move behavior to `features/` once another route uses it.

## Feature owners own product behavior

Keep each product area in one feature directory. Include its UI, workflows, policies, contracts, jobs, tests, and integration calls. Use cohesive files:

```text
apps/api/src/features/review-runs/
  create-review-run.server.ts
  cancel-review-run.server.ts
  expire-review-runs.job.ts
  review-run-policy.ts
  review-runs.contract.ts
  review-runs.test.ts

apps/web/src/features/review-runs/
  review-runs.page.tsx
  review-run-detail.page.tsx
  create-review-run-form.tsx
  review-run-status-badge.tsx
```

Keep validation, authorization, construction, persistence, events, and audit steps together unless they have independent callers, independent tests, or a predictable framework convention. Split when a new module hides complexity; line count alone is insufficient.

## Server primitives are cross-feature infrastructure

Use `server/` for reusable runtime infrastructure:

```text
apps/api/src/server/
  auth/session.ts
  auth/permissions.ts
  db/client.ts
  http/errors.ts
  config/env.ts
  telemetry/events.ts
  email/send-email.ts
```

Keep product workflows in their features.

Bad:

```text
apps/api/src/server/services/billing-service.ts
apps/api/src/server/services/review-run-service.ts
```

Good:

```text
apps/api/src/features/billing/sync-stripe-subscription.server.ts
apps/api/src/features/review-runs/create-review-run.server.ts
```

## Jobs and cron are entrypoints

Put cron handlers and queue consumers where the host requires. Delegate to feature workflows.

```typescript
// apps/worker/src/scheduled.ts
export default {
  async scheduled() {
    await expireOldReviewRuns();
    await syncPastDueSubscriptions();
  },
};
```

The behavior lives with the feature:

```text
apps/api/src/features/review-runs/expire-old-review-runs.job.ts
apps/api/src/features/billing/sync-past-due-subscriptions.job.ts
```

Keep entrypoints limited to scheduling and dispatch. Product policy belongs to the called feature.

## Integrations have two layers

Separate reusable vendor clients from product workflows.

Reusable client:

```text
packages/integrations/stripe/stripe-client.ts
packages/integrations/github/github-app-client.ts
```

Feature workflow:

```text
apps/api/src/features/billing/handle-stripe-webhook.server.ts
apps/api/src/features/repositories/import-github-repository.server.ts
```

Vendor clients own signing, retries, pagination, error normalization, and API calls. Features own product concepts such as trials, teams, and billing entitlements.

Keep a client local while only one app uses it:

```text
apps/api/src/server/integrations/stripe-client.ts
```

Move it to `packages/integrations` for reuse or when it needs library-level testing and versioning.

## Packages are public boundaries

Give stable shared code a package owner:

```text
packages/ui/
  src/button.tsx
  src/dialog.tsx
  src/form-field.tsx
  src/data-table.tsx
  src/page-shell.tsx

packages/contracts/
  src/review-runs/create-review-run.ts
  src/billing/subscription.ts

packages/db/
  src/schema.ts
  migrations/
```

Package exports must be explicit:

```json
{
  "name": "@repo/ui",
  "exports": {
    "./button": "./src/button.tsx",
    "./dialog": "./src/dialog.tsx",
    "./data-table": "./src/data-table.tsx"
  }
}
```

Point each public path directly at the module that defines the component:

```typescript
import { Button } from "@repo/ui/button";
```

Keep reusable primitives and design-system components in `packages/ui`, and product screens in features:

```text
# Package-owned
packages/ui/src/button.tsx
packages/ui/src/dialog.tsx
packages/ui/src/data-table.tsx

# Feature-owned
apps/web/src/features/billing/billing-plan-card.tsx
apps/web/src/features/review-runs/review-run-status-badge.tsx
```


## Share public contracts

Use `packages/contracts` for schemas, branded scalars, API contracts, event payloads, and generated client types shared across runtimes. Keep app code, backend models, and feature workflows out of it.

Good:

```text
packages/contracts/src/review-runs/create-review-run.ts
packages/contracts/src/billing/subscription-status.ts
```

Bad:

```text
packages/contracts/src/review-runs/create-review-run-service.ts
packages/contracts/src/billing/sync-stripe-subscription.ts
```

Keep a schema in its feature until another runtime needs the contract.

## Tests follow the owner

Put tests beside their owner.

Feature tests:

```text
apps/api/src/features/review-runs/review-runs.test.ts
apps/web/src/features/review-runs/create-review-run-form.test.tsx
```

Package tests:

```text
packages/contracts/src/review-runs/create-review-run.test.ts
packages/ui/src/button.test.tsx
```

Cross-runtime browser tests can live in a top-level e2e area:

```text
e2e/review-runs/create-review-run.spec.ts
```

Unit-test policies. Test workflows through real internal wiring, faking only external systems.

## Naming rules

Mark runtime boundaries with suffixes:

- `.server.ts` for server-only modules
- `.client.tsx` for browser-only modules
- `.job.ts` for job behavior
- `.contract.ts` for public schemas and DTOs
- `.page.tsx` for feature page components outside framework route files
- `.test.ts` or `.test.tsx` beside the owner

Avoid vague buckets:

```text
utils/
helpers/
services/
hooks/
components/
types/
data/
```

Use generic directory names only under a clear owner. Keep filenames specific:

```text
features/review-runs/review-run-policy.ts
features/review-runs/use-review-run-events.ts
server/auth/session.ts
```

## When to split

Split when the new file has at least one of these:

- multiple callers
- a stable public contract
- a separate deployment or runtime
- an independently testable domain policy
- a predictable framework location
- an enforceable dependency boundary
- a lifecycle distinct from its caller

A line count, helper name, borrowed pattern, or linter suggestion alone does not justify a split.

## Example

```text
Good: review runs in a complex app.

apps/api/src/routes/review-runs.ts
  Thin HTTP/RPC adapter. Calls feature owners.

apps/api/src/features/review-runs/create-review-run.server.ts
  Parses the public contract, checks permissions, writes DB rows,
  publishes events, and records audit history for one workflow.

apps/api/src/features/review-runs/expire-old-review-runs.job.ts
  Job behavior. Can be called by cron, queue, or admin action.

apps/api/src/features/review-runs/review-run-policy.ts
  Pure policy. Unit tested.

apps/api/src/features/review-runs/review-runs.contract.ts
  Feature-local until another runtime needs it. Promote to
  packages/contracts only when it becomes public across runtimes.

apps/web/src/features/review-runs/create-review-run-form.tsx
  Product UI. Uses @repo/ui primitives but owns product language.

packages/ui/src/button.tsx
  Shared primitive. No review-run language.

Bad: the same feature split by arbitrary layer buckets.

apps/api/src/controllers/review-runs-controller.ts
apps/api/src/services/review-runs-service.ts
apps/api/src/repositories/review-runs-repository.ts
apps/api/src/dto/create-review-run-dto.ts
apps/api/src/jobs/expire-review-runs-job.ts
apps/api/src/events/review-run-events.ts
apps/web/src/components/review-run-status-badge.tsx
apps/web/src/hooks/use-create-review-run.ts

This is only acceptable when the framework owns that convention strongly
enough that every file is mechanically findable. Otherwise it turns product
behavior into a search problem.
```

Example implements: [Structure TypeScript Apps Around Feature Owners](./structure-typescript-apps-around-feature-owners.md), [Build Deep Modules, Not Shallow Abstractions](./build-deep-modules-not-shallow-abstractions.md), [Monorepo Package Boundaries](../packages/monorepo-package-boundaries.md).
