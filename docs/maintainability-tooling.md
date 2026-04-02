# Maintainability Tooling

Opinionated tooling stack for cleaning up strict TypeScript repos without turning maintenance into a vague manual process.

## Recommended baseline

### 1. Knip for dead code and dependency drift

Use `knip` as the default dead-code audit for TypeScript apps and monorepos.

Why:

- Finds unused exports, files, dependencies, and catalog entries
- Understands workspaces/monorepos out of the box
- Has a production mode for "what actually ships"
- Can auto-fix after review

Suggested workflow:

```bash
knip
knip --exports
knip --fix
knip --fix --allow-remove-files
```

Use `@public` and `@internal` tags intentionally when an export is real API surface but looks unused to static analysis.

### 2. Oxlint for the default lint pass

If the repo is already on Vite+ / Oxc tooling, use the Vite+ path first: `vp lint` as the default lint command, with Oxlint as the underlying engine instead of growing an ESLint plugin farm.

High-value rules to turn on early:

- `no-unused-vars`
- `import/no-cycle`
- `import/no-unassigned-import`
- `no-restricted-imports`
- `typescript/no-unnecessary-type-assertion`

Use type-aware linting where available. Use the import plugin when you want cross-file import checks.

If the repo uses Vite+, do not install wrapped tools like Vitest, Oxfmt, Oxlint, or tsdown separately just to access their CLIs. Use `vp`.

### 3. dependency-cruiser for architecture rules

Use `dependency-cruiser` when you want enforceable package-boundary rules instead of "please don’t import that" documentation.

Best uses:

- Detect circular dependencies
- Detect orphan modules
- Detect dependencies missing from `package.json`
- Enforce forbidden edges between apps, packages, feature folders, or test code

This is the right tool for monorepo boundary doctrine.

### 4. jscpd for duplicate code reports

Use `jscpd` when you want a duplicate-code report that is easy to review visually.

Best uses:

- Set a duplication threshold in CI
- Generate an HTML report for cleanup passes
- Catch copy-paste growth before it normalizes

This is more useful as a periodic audit than as a per-commit blocker.

### 5. ast-grep for custom maintainability rules

Use `ast-grep` when you have repo-specific doctrine that generic linters will never encode well.

Best uses:

- Ban a deprecated API shape
- Enforce migration rules
- Find or rewrite narrow patterns across the repo
- Codify "never do X in this codebase" checks without writing a full ESLint plugin

This is the tool for opinionated custom rules and codemods.

### 6. `tsr` as an optional cleanup pass

If you want a more aggressive source-level remover after auditing with Knip, `tsr` is worth testing in a throwaway branch.

Use it carefully:

- Review every diff
- Do not trust it blindly on public API packages
- Treat it as a cleanup assistant, not a default CI gate

## What I would not standardize on

### `ts-prune`

Do not build new workflow around `ts-prune`. Its GitHub repo was archived on September 19, 2025. Prefer Knip first, then use `tsr` only if you specifically want source-editing cleanup.

## Suggested cadence

### Every PR

- `vp check`
- `oxlint` with import rules enabled
- Repo-specific AST rules if present

### Weekly or before releases

- `knip`
- `knip --production`
- `dependency-cruiser`
- `jscpd`

### During focused cleanup work

- `knip --fix`
- `tsr` in a review branch
- `ast-grep scan -r rules/`

## Sources

- Knip monorepo/workspaces: https://knip.dev/features/monorepos-and-workspaces
- Knip unused exports: https://knip.dev/typescript/unused-exports
- Knip unused dependencies: https://knip.dev/typescript/unused-dependencies
- Knip production mode: https://knip.dev/features/production-mode
- Knip auto-fix: https://knip.dev/features/auto-fix
- Knip JSDoc/TSDoc tags: https://knip.dev/reference/jsdoc-tsdoc-tags
- Oxlint linter overview: https://oxc.rs/docs/guide/usage/linter.html
- Oxlint type-aware linting: https://oxc.rs/docs/guide/usage/linter/type-aware.html
- Oxlint multi-file analysis: https://oxc.rs/docs/guide/usage/linter/multi-file-analysis
- Oxlint `no-unused-vars`: https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-unused-vars
- Oxlint `import/no-unassigned-import`: https://oxc.rs/docs/guide/usage/linter/rules/import/no-unassigned-import
- dependency-cruiser: https://github.com/sverweij/dependency-cruiser
- jscpd HTML reporter: https://jscpd.dev/reporters/html
- ast-grep rule catalog: https://ast-grep.github.io/catalog/
- ast-grep project config: https://ast-grep.github.io/guide/project/project-config.html
- ast-grep rewrite code: https://ast-grep.github.io/guide/rewrite-code.html
- `tsr`: https://github.com/line/tsr
- `ts-prune` archive notice: https://github.com/nadeesha/ts-prune/discussions
