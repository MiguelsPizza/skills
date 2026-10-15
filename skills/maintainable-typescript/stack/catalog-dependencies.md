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

**Rule:** Pin dependency versions in the `pnpm-workspace.yaml` catalog. Do not install tools the toolchain provides or add dependencies for trivial work.

See also: [Opinionated Stack](./stack-overview.md) and [Use Mature Dependencies, Don't Roll Your Own](../doctrine/packages/use-mature-dependencies-dont-roll-your-own.md).

## Why agents get this wrong

Adding dependencies within individual packages creates version drift and can duplicate tools already included by Vite+.

## What to do instead

Use `catalog:` in package manifests to reference the shared version registry.

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

Vite+ already provides these tools:

- `vitest` through `vp test`
- `oxlint` through `vp lint`
- `oxfmt` through `vp fmt`
- `tsdown` through `vp pack`

Use `vp` for dependency operations:

```bash
vp add zod
vp dlx drizzle-kit generate
```

Add justified dependencies through the catalog workflow.

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

Example implements: [Catalog Dependencies](./catalog-dependencies.md), [Opinionated Stack](./stack-overview.md), [Use Mature Dependencies, Don't Roll Your Own](../doctrine/packages/use-mature-dependencies-dont-roll-your-own.md).
