# Maintainability Tooling

Opinionated tooling stack for cleaning up strict TypeScript repos without turning maintenance into a vague manual process.

## Recommended baseline

### 1. Fallow for codebase intelligence

Use `fallow` as the default maintainability audit for TypeScript apps and monorepos.

Why:

- Finds unused files, exports, types, dependencies, unresolved imports, unlisted dependencies, cycles, and stale suppressions
- Covers dev/optional dependency hygiene, pnpm catalog drift, dependency override drift, enum/class members, and re-export cycles
- Runs duplication and health checks from the same binary
- Supports architecture boundaries through presets or custom zones
- Supports `fallow audit` for changed-code gates and `--format json` for agents
- Can migrate existing Knip and jscpd config with `fallow migrate`

Suggested workflow:

```bash
fallow
fallow dead-code
fallow dupes
fallow health --score --hotspots --targets
fallow audit
fallow fix --dry-run
```

Start without config. Add `.fallowrc.json` only when the repo needs custom entries, ignores, boundaries, rules, thresholds, or staged baselines. For agent-readable output, use `--format json --quiet`; exit code 1 means Fallow found error-severity issues, while exit code 2 means the command or config failed.

### 2. TypeScript, linting, and formatting stay separate

Fallow is not a type checker, linter, or formatter. Keep the existing repo-native commands for those jobs.

Use:

- `tsc --noEmit` or the repo's normal type-check command for type correctness
- `vp lint` in Vite+ repos; otherwise the repo's chosen linter
- `vp fmt` in Vite+ repos; otherwise the repo's chosen formatter

If the repo uses Vite+, do not install wrapped tools like Vitest, Oxfmt, Oxlint, or tsdown separately just to access their CLIs. Use `vp`.

### 3. Existing linter and formatter config for local policy

Put repo-specific local rules in the config the repo already runs.

Best uses:

- Ban a deprecated API shape
- Enforce migration rules
- Ban `as any`, `@ts-ignore`, and restricted imports
- Keep formatting decisions in the formatter config

Use ESLint, Oxlint, Prettier, or the repo's current lint and format layer. Do not add a separate scanner just to express rules those tools can already enforce.

## What I would not standardize on

### Knip, jscpd, and dependency-cruiser as the default stack

Do not build new TypeScript maintainability workflows around separate Knip, jscpd, and dependency-cruiser passes unless a repo already has a strong reason to keep them.

Fallow now covers the core reasons we used those tools:

- Knip replacement: dead files, exports, dependencies, workspaces, production mode, and auto-fix preview
- jscpd replacement: duplicate-code analysis through `fallow dupes`
- dependency-cruiser replacement: circular dependencies and boundary violations through `fallow dead-code`

Keep an old tool only when it has a repo-specific rule or report format that Fallow does not yet model.

### `ts-prune`

Do not build new workflow around `ts-prune`. Use Fallow dead-code analysis instead.

### `tsr`

Do not make `tsr` the default cleanup path. Use `fallow fix --dry-run` first, then apply only reviewed, narrow cleanup.

## Suggested cadence

### Every PR

- repo type check
- repo lint and format commands
- `fallow audit`

### Weekly or before releases

- `fallow`
- `fallow dead-code --production`
- `fallow health --score --hotspots --targets`
- `fallow dupes`

### During focused cleanup work

- `fallow dead-code`
- `fallow dupes --mode semantic`
- `fallow fix --dry-run`

## Sources

- Fallow documentation: https://docs.fallow.tools/
- Fallow quick start: https://docs.fallow.tools/quickstart
- Fallow installation: https://docs.fallow.tools/installation
- Fallow vs Knip and migration: https://docs.fallow.tools/migration/from-knip
- Fallow jscpd migration: https://docs.fallow.tools/migration/from-jscpd
- Fallow architecture boundaries: https://docs.fallow.tools/analysis/boundaries
- Fallow audit: https://docs.fallow.tools/cli/audit
- Fallow source README: https://github.com/fallow-rs/fallow
