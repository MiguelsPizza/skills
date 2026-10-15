# TypeScript Repo Tooling

Templates and audit scripts for TypeScript applications and packages.

[Oxlint Maintainability](../skills/oxlint-maintainability/SKILL.md) ships lint rules in `assets/maintainable/`. [Tests](oxlint/tests) cover that source and copied installs. Run `pnpm check` from the repository root.

## What to copy into a target repo root

- `tooling/templates/.fallowrc.json` -> `.fallowrc.json`

Run Fallow without config first. Add the template when you need severities, ignores, boundaries, thresholds, or baselines.

## Recommended install

```bash
pnpm add -D fallow typescript
```

In Vite+ repos, use `vp` for installs, linting, formatting, tests, and builds. Use its bundled tools.

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

Configure local rules in the target repo's existing linter and formatter.

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

- `fallow`: dead code, dependencies, catalogs, overrides, cycles, boundaries, duplication, complexity, health, and change audits
- `oxlint`: lint rules; use `vp lint` in Vite+ repos

## Opinionated defaults

- Detect dead code, duplication, and complexity with static tools.
- Enforce dependency direction.
- Keep lint and formatting rules in executable config.
