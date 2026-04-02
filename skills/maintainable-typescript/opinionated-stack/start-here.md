# Start Here

This directory is the house doctrine for repos that intentionally use the full opinionated stack. Use this file as the map, not as the place where every decision is re-explained.

## Use this directory when

- the repo already uses this stack
- the repo is intentionally converging toward this stack
- the task touches framework choice, schema ownership, docs policy, dependency policy, or design-system policy

If the repo only needs portable maintainability rules, stay in [`../references/`](../references/).

## Core shape

- content sites use Astro
- product applications use a React SPA with TanStack Router
- backend concerns live in Cloudflare Workers
- shared contracts derive from source-of-truth schemas
- the toolchain runs through Vite+ via `vp`

## Read next

- [`stack-overview.md`](stack-overview.md) for the full architecture and layout
- [`design-openapi-for-inference.md`](design-openapi-for-inference.md) for the contract-first API and spec doctrine
- [`do-not-use-nextjs.md`](do-not-use-nextjs.md) for framework boundaries
- [`do-not-synchronize-state-with-useeffect.md`](do-not-synchronize-state-with-useeffect.md) for React state ownership
- [`catalog-dependencies.md`](catalog-dependencies.md) for catalog and `vp` workflow
- [`errors-are-schema.md`](errors-are-schema.md) for API error doctrine
- [`document-fields-in-derived-zod-schemas.md`](document-fields-in-derived-zod-schemas.md) for field-level API semantics and examples
- [`jsdoc-with-first-party-sources.md`](jsdoc-with-first-party-sources.md) for comment policy, targeted JSDoc, and provenance
- [`no-magic-values.md`](no-magic-values.md) for constant ownership
- [`use-branded-scalar-types.md`](use-branded-scalar-types.md) for branded IDs and non-interchangeable scalars
- [`use-canonical-named-types.md`](use-canonical-named-types.md) for domain type ownership
- [`otel-conventions-from-day-one.md`](otel-conventions-from-day-one.md) for observability naming
- [`schema-migrations-are-generated.md`](schema-migrations-are-generated.md) for database workflow
- [`test-react-apps-in-real-browsers.md`](test-react-apps-in-real-browsers.md) for browser testing lanes
- [`use-the-design-system-not-ad-hoc-tailwind.md`](use-the-design-system-not-ad-hoc-tailwind.md) for frontend system discipline
