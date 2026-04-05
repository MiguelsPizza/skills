---
example:
  primary: catalog-dependencies
  format: text
  implements:
    - catalog-dependencies
    - stack-overview
    - use-mature-dependencies-dont-roll-your-own
---
# Catalog Dependencies

**Rule:** Pin dependency versions in `pnpm-workspace.yaml` catalog, not per-package. Never install what the toolchain provides. Never add a dependency for something trivial.

See also: [Opinionated Stack](stack-overview.md) and [Use Mature Dependencies, Don't Roll Your Own](../references/use-mature-dependencies-dont-roll-your-own.md).

## Why agents get this wrong

Agents run `pnpm add` in whatever package they're working on, installing the latest version without checking if it's already in the catalog. This creates version drift — the same dependency at different versions across packages. Agents also install tools that are already provided by the toolchain (e.g., installing `vitest` when Vite+ already includes it).

## What to do instead

Use the workspace catalog as the canonical version registry for shared dependencies. Package manifests should reference `catalog:` instead of pinning their own versions.

```yaml
# pnpm-workspace.yaml
packages:
  - apps/*
  - packages/*

catalogMode: prefer
catalog:
  react: ^19.2.4
  react-dom: ^19.2.4
  zod: ^3.25.76
  drizzle-orm: ^0.45.1
  hono: ^4.12.3
  "@cloudflare/workers-types": ^4.x
  wrangler: ^4.72.0
```

```json
// packages/contracts/package.json
{
  "dependencies": {
    "zod": "catalog:"
  }
}
```

If using Vite+, these are already available — don't install them:
- `vitest` (use `vp test`)
- `oxlint` (use `vp lint`)
- `oxfmt` (use `vp fmt`)
- `tsdown` (use `vp pack`)

Use `vp` for dependency operations:

```bash
vp add zod
vp dlx drizzle-kit generate
```

If you decide a dependency is justified, add it through the catalog workflow. This file owns version and toolchain policy, not the broader build-vs-buy doctrine.

## Example

Workspace catalog

```yaml
packages:
  - apps/*
  - packages/*

catalog:
  zod: ^3.25.76
  react: ^19.2.4
  "@tanstack/react-router": ^1.132.0
```

Package manifest

```json
{
  "name": "@repo/contracts",
  "dependencies": {
    "zod": "catalog:"
  }
}
```

Example implements: [Catalog Dependencies](catalog-dependencies.md), [Opinionated Stack](stack-overview.md), [Use Mature Dependencies, Don't Roll Your Own](../references/use-mature-dependencies-dont-roll-your-own.md).
