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

**Rule:** Keep framework entrypoints thin, put product behavior in predictable feature owners, and promote only true shared contracts or primitives into packages.

See also: [Build Deep Modules, Not Shallow Abstractions](./build-deep-modules-not-shallow-abstractions.md), [Monorepo Package Boundaries](../packages/monorepo-package-boundaries.md), and [Naming Is Navigation](../foundations/naming-is-navigation.md).

## Why agents get this wrong

Agents copy layer names without copying the convention that made those layers usable. They create `controllers/`, `services/`, `repositories/`, `utils/`, `hooks/`, `components/`, and `jobs/`, then spread one feature across every bucket. That looks familiar, but it is not navigable unless the framework makes the next file mechanically obvious.

Modern TypeScript web apps usually have MVC-shaped forces:
- interface code: routes, pages, controllers, RPC handlers
- product code: workflows, policies, state transitions, permissions
- persistence code: schema, queries, migrations
- integration code: Stripe, GitHub, OpenAI, email, storage, webhooks
- job code: cron, queues, scheduled workers
- UI code: design-system primitives and feature-specific screens
- contract code: schemas, API contracts, shared DTOs

The mistake is letting any adapter bucket own product behavior. A route, cron handler, queue consumer, or Stripe client should not become the place where the business rule lives.

AI makes this worse. The model can read a large feature file quickly once it finds it. It is much worse at discovering that a single workflow is split across seven arbitrary directories.

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

If the framework combines web and backend in one app, keep the same ideas under one runtime:

```text
apps/web/src/
  app/ or routes/
  features/
  server/
  jobs/
  test/
```

Do not add a second app just to look architectural. Add a separate `apps/api` or `apps/worker` only when it is a separate deployable runtime, scaling unit, permission boundary, or build target.

## Route files are adapters

Routes, pages, controllers, and RPC handlers parse transport state and call the owner. They should be small because the framework already makes them findable.

```typescript
// apps/api/src/routes/review-runs.ts
export async function postReviewRun(request: Request) {
  const input = await readJson(request);
  const user = await requireSession(request);
  const result = await createReviewRun({ input, user });
  return json(result);
}
```

The route does not own validation policy, permissions, persistence, events, or audit logging. Those live in the feature:

```text
apps/api/src/features/review-runs/create-review-run.server.ts
```

Framework route trees are allowed to colocate route-only UI, loaders, and tiny helpers when the framework makes non-route files safe and obvious. Keep the route tree thin anyway. Once a behavior is reused by another route, move it to `features/`.

## Feature owners own product behavior

A feature directory is the canonical home for one product area. It may contain UI, server workflows, policies, contracts, jobs, tests, and feature-local integration use.

Prefer cohesive files over one-helper files:

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

Do not split `create-review-run.server.ts` into `validate-create-review-run.ts`, `authorize-create-review-run.ts`, `build-review-run.ts`, `save-review-run.ts`, `publish-review-run-created.ts`, and `audit-review-run-created.ts` unless those files have independent callers, independent tests, or a strong convention that makes the split findable.

A 500-line feature workflow can be more maintainable than nine files with one caller each. Split when the new file becomes a deeper module, not when a section can be named.

## Server primitives are cross-feature infrastructure

Use `server/` for reusable backend primitives, not product logic:

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

This code should answer "how does this runtime work?" not "what does billing do?"

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

Cron files, scheduled handlers, and queue consumers are adapters. Put them where the host requires, then delegate.

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

Do not put product policy in `cron.ts`, `scheduled.ts`, `queue-consumer.ts`, or `jobs/index.ts`. Those files should tell you what runs, not define what the product means.

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

The integration package should know how to sign, retry, paginate, normalize vendor errors, and call the vendor API. It should not know what a trial, review run, team, tenant, or billing entitlement means. Product meaning belongs to the feature.

If only one app uses the integration, keep the client app-local until a second real consumer appears:

```text
apps/api/src/server/integrations/stripe-client.ts
```

Promote to `packages/integrations` when reuse is real or the client is foundational enough to test and version like a library.

## Packages are public boundaries

Use packages for stable shared ownership:

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

Do not make `@repo/ui` a root mega-barrel. The import path should tell the model what it is using:

```typescript
import { Button } from "@repo/ui/button";
```

`packages/ui` owns reusable primitives and design-system components. It does not own product screens:

```text
# Package-owned
packages/ui/src/button.tsx
packages/ui/src/dialog.tsx
packages/ui/src/data-table.tsx

# Feature-owned
apps/web/src/features/billing/billing-plan-card.tsx
apps/web/src/features/review-runs/review-run-status-badge.tsx
```

Product language stays with the feature.

## Contracts are not shared internals

`packages/contracts` exists so runtimes agree on public shapes. It should contain schemas, branded scalars, API contracts, event payloads, and generated client types.

It should not import app code. It should not import backend models. It should not contain feature workflows.

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

If a schema is only used inside one backend workflow, keep it in that feature until it becomes a real contract.

## Tests follow the owner

Put tests where the reader already is.

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

Core policies should have focused unit tests. Workflows should usually have integration-style tests that use real internal wiring and fake only external systems.

## Naming rules

Use suffixes to make runtime boundaries visible:

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

These names are acceptable only when nested under a strong owner and still specific:

```text
features/review-runs/review-run-policy.ts
features/review-runs/use-review-run-events.ts
server/auth/session.ts
```

## When to split

Split a file when the new file has at least one of these:
- multiple real callers
- a stable public contract
- a separate deploy/runtime boundary
- a separately testable domain policy
- a framework convention that makes it mechanically findable
- a dependency boundary worth enforcing
- a lifecycle that is genuinely different from the caller

Do not split because:
- the file crossed an arbitrary line count
- a helper can be named
- a class/service/repository pattern exists in another framework
- a linter or agent suggested smaller files without explaining the owner
- a workflow looks more "enterprise" when spread across directories

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
