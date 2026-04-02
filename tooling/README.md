# TypeScript Repo Tooling

Portable tooling templates and scripts for maintainable TypeScript repos.

These are not for maintaining this repo's markdown opinions. They are for auditing real application and package repos.

## What to copy into a target repo root

- `tooling/templates/.knip.json` -> `.knip.json`
- `tooling/templates/.dependency-cruiser.mjs` -> `.dependency-cruiser.mjs`
- `tooling/templates/.jscpd.json` -> `.jscpd.json`
- `tooling/templates/sgconfig.yml` -> `sgconfig.yml`
- `tooling/templates/ast-grep/` -> `ast-grep/`

## Recommended install

```bash
pnpm add -D knip dependency-cruiser jscpd @ast-grep/cli oxlint typescript
```

If the repo already uses Vite+ / `vp`, do not treat that install command as the default. Keep `typescript` and `oxlint` aligned with Vite+, prefer `vp lint` over invoking `oxlint` directly, and do not install wrapped tools like Vitest, Oxfmt, Oxlint, or tsdown separately just to reach their CLIs.

## Generic audit runner

From this repo:

```bash
bash scripts/audit-typescript-repo.sh /path/to/target-repo
```

What it does:

- runs `tsc --noEmit` when a root `tsconfig.json` exists
- runs `vp lint` when the target repo uses Vite+
- otherwise runs `oxlint` when installed
- runs `knip` when installed
- runs `dependency-cruiser` when both the binary and config exist
- runs `jscpd` when both the binary and config exist
- runs `ast-grep scan` when both the binary and config exist

This script is intentionally thin. The real policy lives in the target repo config files.

## Suggested package.json scripts for the target repo

```json
{
  "scripts": {
    "check:types": "tsc --noEmit",
    "check:lint": "vp lint",
    "check:dead": "knip",
    "check:deps": "depcruise . --config .dependency-cruiser.mjs",
    "check:dupes": "jscpd --config .jscpd.json src packages apps",
    "check:ast": "ast-grep scan --project .",
    "check:maintainability": "vp run check:types && vp run check:lint && vp run check:dead && vp run check:deps && vp run check:dupes && vp run check:ast"
  }
}
```

For non-Vite+ repos, replace `vp lint` and `vp run ...` with the repo's actual package-manager workflow.

## What each tool is for

- `knip`: dead exports, dead files, dead dependencies
- `dependency-cruiser`: circular deps, orphan modules, forbidden import edges
- `jscpd`: duplicated code
- `ast-grep`: repo-specific maintainability rules and codemods
- `oxlint`: fast default lint engine, usually reached through `vp lint` in Vite+ repos

## Opinionated defaults

- Dead code should be detected by static tooling, not by memory
- Dependency direction should be enforced, not merely documented
- Duplicate code should be reported before it normalizes
- Repo-specific doctrine should live in AST rules, not in tribal knowledge
