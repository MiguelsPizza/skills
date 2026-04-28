# Maintainability Tooling

Use these tools when the task is not just "make it work", but "leave the TypeScript repo easier to change next week."

## When to run the bundled scripts

- `scripts/audit-typescript-dead-code.sh` for unused exports, files, dependencies, and obvious type/lint drift
- `scripts/audit-typescript-duplicate-code.sh` for copy-paste growth and repeated implementation blocks
- `scripts/audit-typescript-architecture.sh` for circular imports, package-boundary violations, and custom AST rules
- `scripts/audit-typescript-repo.sh` for a combined first pass

These scripts are bundled with this skill and target the project you are currently working in. Resolve them from the skill root before running them.

If the target repo uses Vite+, prefer its `vp` workflow for linting and validation. Do not install wrapped tools like Vitest, Oxfmt, Oxlint, or tsdown separately just to reach their binaries.

## Bundled templates

This skill includes copyable templates under `assets/tooling-templates/` for:

- `.knip.json`
- `.dependency-cruiser.mjs`
- `.jscpd.json`
- `sgconfig.yml`
- `ast-grep/`

If the target repo does not already define those files, copy the ones you need into the target repo root before rerunning the relevant audit.

## Tool choices

### Knip

Use `knip` for dead exports, dead files, dead dependencies, and unused workspace entries.

Best for:

- trimming stale exports after refactors
- catching files nobody imports anymore
- finding dependencies that no longer belong in the repo

### Oxlint

Use `oxlint` as the fast default lint pass when the repo already leans on the Oxc / Vite+ toolchain. In Vite+ repos, prefer the repo's wrapper command such as `vp lint` when it exists.

Best for:

- unused variables
- import hygiene
- fast local lint feedback before deeper audits

### dependency-cruiser

Use `dependency-cruiser` when the problem is architectural, not stylistic.

Best for:

- circular imports
- orphan modules
- forbidden app/package dependency direction

### jscpd

Use `jscpd` when you suspect copy-paste development is normalizing.

Best for:

- duplicated handlers
- cloned service functions
- repeated test setup or fixture logic

### ast-grep

Use `ast-grep` when your doctrine is too specific for off-the-shelf lint rules.

Best for:

- banning `as any`
- banning `@ts-ignore`
- repo-specific migration rules
- targeted codebase scans and codemods

## Vite+ defaults

When the target repo is on Vite+:

- use `vp lint`, not raw `oxlint`
- use `vp test`, not raw `vitest`
- use `vp fmt`, not raw `oxfmt`
- use `vp pack`, not raw `tsdown`
- use `vp add` and `vp dlx` instead of direct package-manager commands

## Interpretation rules

- An audit finding is not automatically a delete.
- Public APIs, generated files, and intentional compatibility surfaces need human judgment.
- Prefer fixing the source of truth instead of silencing the tool.
- If the same category of finding appears repeatedly, add or tighten a rule instead of relying on memory.
