# TypeScript Repo Tooling

Portable tooling templates and scripts for maintainable TypeScript repos.

These are not for maintaining this repo's markdown opinions. They are for auditing real application and package repos.

## What to copy into a target repo root

- `tooling/templates/.fallowrc.json` -> `.fallowrc.json`

Run Fallow without config first. Copy the template only when the target repo needs explicit severities, ignores, boundaries, thresholds, or baselines.

## Recommended install

```bash
pnpm add -D fallow typescript
```

If the repo already uses Vite+ / `vp`, do not treat that install command as the default. Keep TypeScript, linting, formatting, testing, and package operations aligned with Vite+. Prefer `vp lint` and `vp fmt`, and do not install wrapped tools like Vitest, Oxfmt, Oxlint, or tsdown separately just to reach their CLIs.

## Generic audit runner

From this repo:

```bash
bash scripts/audit-typescript-repo.sh /path/to/target-repo
```

What it does:

- runs `tsc --noEmit` when a root `tsconfig.json` exists
- runs `vp lint` when the target repo uses Vite+
- otherwise runs `oxlint` when installed
- runs `fallow` when installed

This script is intentionally thin. The real policy lives in the target repo config files.

Put repo-specific bans and style rules in the target repo's existing linter and formatter configs.

## Suggested package.json scripts for the target repo

```json
{
  "scripts": {
    "check:types": "tsc --noEmit",
    "check:lint": "vp lint",
    "fmt": "vp fmt",
    "check:fallow": "fallow",
    "check:dead": "fallow dead-code",
    "check:dupes": "fallow dupes",
    "check:health": "fallow health --score --hotspots --targets",
    "check:audit": "fallow audit",
    "check:maintainability": "vp run check:types && vp run check:lint && vp run check:fallow"
  }
}
```

For non-Vite+ repos, replace `vp lint` and `vp run ...` with the repo's actual package-manager workflow.

## What each tool is for

- `fallow`: dead code, dependency hygiene, pnpm catalog and override hygiene, cycles, boundaries, duplication, complexity, health, and changed-code audit gates
- `oxlint`: fast default lint engine, usually reached through `vp lint` in Vite+ repos

## Opinionated defaults

- Dead code should be detected by static tooling, not by memory
- Dependency direction should be enforced, not merely documented
- Duplicate code should be reported before it normalizes
- Complexity should become visible before it becomes architecture
- Repo-specific lint and formatting doctrine should live in executable linter or formatter config, not in tribal knowledge
