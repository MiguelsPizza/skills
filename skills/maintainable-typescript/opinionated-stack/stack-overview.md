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
│   └── shared-types/            # Zod schemas, constants, and inferred runtime types
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

Everything runs through `vp` (Vite+). No direct `pnpm`, `npm`, or `yarn` usage in normal workflow.

High-signal commands:

- `vp install`
- `vp dev`
- `vp build`
- `vp test`
- `vp check`
- `vp lint`
- `vp fmt`
- `vp add <pkg>`
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
- Testing: Vitest Browser Mode + Playwright + MSW

## SSOT Chain

```text
@repo/db schema
  -> drizzle-zod
  -> @repo/shared-types domain file
  -> TypeScript types
  -> oRPC contracts
  -> OpenAPI spec
  -> client hooks
```

One source, everything derived.

## Canonical doctrine map

- Framework boundaries: [Do Not Use Next.js](do-not-use-nextjs.md)
- React state ownership: [Do Not Synchronize State with useEffect](do-not-synchronize-state-with-useeffect.md)
- Dependency and toolchain policy: [Catalog Dependencies](catalog-dependencies.md)
- Error contracts: [Errors Are Schema, Not Strings](errors-are-schema.md)
- Comments, JSDoc, and provenance: [Comments and JSDoc Must Carry Information](jsdoc-with-first-party-sources.md)
- Constants and literals: [No Magic Values](no-magic-values.md)
- Branded domain scalars: [Use Branded Scalar Types](use-branded-scalar-types.md)
- Observability naming: [OTEL Conventions from Day One](otel-conventions-from-day-one.md)
- Database workflow: [Schema Migrations Are Generated](schema-migrations-are-generated.md)
- Browser testing lanes: [Test React Apps in Real Browsers](test-react-apps-in-real-browsers.md)
- Domain type ownership: [Use Canonical Named Types, Not Inline Object Shapes](use-canonical-named-types.md)
- Frontend styling discipline: [Use the Design System, Not Ad Hoc Tailwind](use-the-design-system-not-ad-hoc-tailwind.md)
