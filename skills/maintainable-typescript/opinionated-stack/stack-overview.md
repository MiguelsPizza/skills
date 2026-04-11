# Opinionated Stack

This file is the canonical architecture summary for the house stack. Other stack opinions should link here instead of repeating the full stack description.

## Monorepo Layout

```text
project/
├── apps/
│   ├── main-app/                # TanStack Router SPA (React 19)
│   │   ├── src/                 # Frontend source
│   │   ├── worker/              # Cloudflare Worker backend
│   │   ├── migrations/          # Drizzle-generated SQL
│   │   ├── wrangler.jsonc       # CF environments + bindings
│   │   ├── vite.config.ts       # App-specific Vite config
│   │   ├── tsconfig.app.json    # Frontend TypeScript
│   │   └── tsconfig.worker.json # Backend TypeScript
│   ├── landing-page/            # Astro 6 static marketing site
│   └── documentation-website/   # Mintlify docs
├── packages/
│   ├── db/                      # Drizzle tables, relations, and DB-layer operations
│   └── contracts/              # Zod schemas, constants, and inferred runtime types
├── e2e/                         # Cross-app browser tests
├── .sources/                    # Checked-in source material and derivations
├── .dependency-references/      # Vendored dependency references for docs
├── pnpm-workspace.yaml
├── package.json
├── vite.config.ts
├── tsconfig.json
└── AGENTS.md
```

## Toolchain

Everything runs through `vp` (Vite+). Treat it as the unified toolchain, not just a task alias. Vite+ wraps package management, runtime management, and the underlying frontend tools behind one CLI.

In this stack:

- do not use `pnpm`, `npm`, or `yarn` directly in normal workflow
- do not install wrapped tools like `vitest`, `oxlint`, `oxfmt`, or `tsdown` just to reach their CLIs
- use `vp run <script>` for custom package scripts, because `vp dev`, `vp build`, `vp test`, and similar built-ins always run the Vite+ tool, not a same-named script
- import JavaScript modules from `vite-plus`, not from `vite` or `vitest`, when the repo is already on Vite+

High-signal commands:

- `vp install`
- `vp dev`
- `vp build`
- `vp pack`
- `vp preview`
- `vp test`
- `vp check`
- `vp lint`
- `vp fmt`
- `vp run <script>`
- `vp add <pkg>`
- `vp remove <pkg>`
- `vp dlx <bin>`

For dependency ownership and install policy, see [Catalog Dependencies](catalog-dependencies.md).

## Stack Choices

- Router: TanStack Router
- Data fetching: TanStack Query
- UI: React 19
- Styling: Tailwind CSS 4
- Components: shadcn/ui + Radix
- API: oRPC + Hono
- Database: Drizzle + D1
- Validation: Zod, derived from schema where possible
- Runtime: Cloudflare Workers + Durable Objects
- Toolchain: Vite+ via `vp`
- Testing: Vite+ browser testing + Playwright + MSW
  Browser and backend durable lanes should attach regressions to real route and request boundaries.

## SSOT Chain

```text
@repo/db schema
  -> drizzle-zod
  -> @repo/contracts domain file
  -> TypeScript types
  -> oRPC contracts
  -> OpenAPI spec
  -> client hooks
```

One source, everything derived.

## Canonical doctrine map

- Framework boundaries: [Do Not Use Next.js](do-not-use-nextjs.md)
- API contract and spec inference: [Design OpenAPI for Inference](design-openapi-for-inference.md)
- React state ownership: [Do Not Synchronize State with useEffect](do-not-synchronize-state-with-useeffect.md)
- Dependency and toolchain policy: [Catalog Dependencies](catalog-dependencies.md)
- Error contracts: [Errors Are Schema, Not Strings](errors-are-schema.md)
- Field semantics on contract schemas: [Document Fields in Derived Zod Schemas](document-fields-in-derived-zod-schemas.md)
- Comments, JSDoc, and provenance: [Comments and JSDoc Must Carry Information](jsdoc-with-first-party-sources.md)
- Constants and literals: [No Magic Values](no-magic-values.md)
- Branded domain scalars: [Use Branded Scalar Types](use-branded-scalar-types.md)
- Observability naming: [OTEL Conventions from Day One](otel-conventions-from-day-one.md)
- Database workflow: [Schema Migrations Are Generated](schema-migrations-are-generated.md)
- Browser testing lanes: [Test React Apps in Real Browsers](test-react-apps-in-real-browsers.md)
- Worker request-driven backend tests: [Test Cloudflare Workers Through Real Requests](test-cloudflare-workers-through-real-requests.md)
- Signed webhook contract tests: [Test GitHub Webhooks as Signed Contracts](test-github-webhooks-as-signed-contracts.md)
- AI-app assertion discipline: [Test AI Apps by Artifacts, Not Prose](test-ai-apps-by-artifacts-not-prose.md)
- Domain type ownership: [Use Canonical Named Types, Not Inline Object Shapes](use-canonical-named-types.md)
- Frontend styling discipline: [Use the Design System, Not Ad Hoc Tailwind](use-the-design-system-not-ad-hoc-tailwind.md)
