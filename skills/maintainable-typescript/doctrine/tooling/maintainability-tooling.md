# Maintainability Tooling

Use these tools to find maintainability problems in TypeScript repos.

## When to run the bundled scripts

- `scripts/audit-typescript-dead-code.sh` for type/lint drift plus Fallow dead-code and dependency hygiene
- `scripts/audit-typescript-duplicate-code.sh` for Fallow duplicate-code analysis
- `scripts/audit-typescript-architecture.sh` for Fallow circular imports and boundary violations
- `scripts/audit-typescript-repo.sh` for a combined first pass, including Fallow health

Resolve bundled scripts from the skill root and run them against the current project.

The scripts run installed tools from the target directory and skip missing tools. Every check runs even after a failure; the final status is the highest exit code. Read tool output to distinguish findings from execution errors. Oxlint skips `node_modules`; keep other generated-file ignores in the project config.

If the target repo uses Vite+, prefer its `vp` workflow for linting, formatting, testing, and package operations. Do not install wrapped tools like Vitest, Oxfmt, Oxlint, or tsdown separately just to reach their binaries.

## Bundled templates

Copyable Fallow config lives at `assets/tooling-templates/.fallowrc.json`.

Run Fallow once before adding config. Copy `.fallowrc.json` only when the repo needs explicit severities, ignore patterns, boundary policy, thresholds, or committed baselines.

## Tool choices

### Fallow

Run `fallow` by default when auditing strict TypeScript repos.

Best for:

- dead files, exports, types, dependencies, and stale suppressions
- dev/optional dependency hygiene, unlisted or unresolved imports, pnpm catalog and override drift
- circular dependencies, re-export cycles, and architecture boundary violations
- duplicated implementation blocks
- complexity, health score, hotspots, and refactoring targets
- changed-code gates with `fallow audit`
- optional feature-flag and private-type-leak checks when the repo wants those policies

Start with `fallow` or focused commands:

```bash
fallow
fallow dead-code
fallow dupes
fallow health --score --hotspots --targets
fallow audit
fallow fix --dry-run
```

Use `--format json --quiet` when an agent or CI job will parse the output. Treat exit code 1 as "findings exist" and exit code 2 as a real tool/config error. Use `fallow init` when the repo needs generated config. Use `fallow migrate --dry-run` before replacing existing Knip or jscpd config. Keep `.fallow/` gitignored; committed baselines belong in a deliberate repo path such as `fallow-baselines/`.

### TypeScript, linting, and formatting

Use repo-native commands for type checking, linting, and formatting:

- use `tsc --noEmit` or the repo's normal type-check command
- use `vp lint`, not raw `oxlint`, in Vite+ repos
- use `vp fmt`, not raw `oxfmt`, in Vite+ repos

Put repo-specific local rules in the existing linter config before adding another scanner. Ban `as any`, `@ts-ignore`, deprecated imports, restricted paths, and migration-only APIs through ESLint, Oxlint, or the repo's current lint layer. Keep formatting in the formatter config, not in Fallow.

Use the [Oxlint Maintainability skill](https://github.com/MiguelsPizza/skills/tree/main/skills/oxlint-maintainability) for this doctrine's runnable presets. Native rules enforce casts and compiler directives; custom rules enforce re-exports and internal module mocks. Transparent wrapper and shape checks produce review warnings. Keep graph analysis in Fallow and semantic boundary/schema decisions in review.

## Vite+ defaults

When the target repo is on Vite+:

- use `vp lint`, not raw `oxlint`
- use `vp test`, not raw `vitest`
- use `vp fmt`, not raw `oxfmt`
- use `vp pack`, not raw `tsdown`
- use `vp add` and `vp dlx` instead of direct package-manager commands

## Interpretation rules

- Review audit findings before deleting code, especially public APIs, generated files, framework conventions, and intentional compatibility surfaces.
- Fix the source of truth.
- Keep Fallow exceptions narrow.
- If the same category of lint or formatting issue appears repeatedly, add or tighten a linter or formatter rule instead of relying on memory.
