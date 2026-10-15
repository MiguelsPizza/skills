---
name: maintainable-typescript
description: Clean up, refactor, and review strict TypeScript repos and monorepos. Use for dead code, duplication, module ownership, and package boundaries.
---

# Maintainable TypeScript

Apply these rules when changing or reviewing strict TypeScript code.

## Load Order

Read the files that match the task. For the house stack, start with [`stack/start-here.md`](./stack/start-here.md).

Load [`doctrine/`](doctrine/), [`stack/`](stack/), [`prompts/`](prompts/), [`scripts/`](scripts/), and [`assets/tooling-templates/`](assets/tooling-templates/) as needed.

## Companion Skills

Use `oxlint-maintainability` to reject re-exports, type escape hatches, and internal module mocks. Review wrapper and shape warnings using its [coverage map](https://github.com/MiguelsPizza/skills/blob/main/skills/oxlint-maintainability/references/coverage.md). Install with `npx skills add miguelspizza/skills --skill oxlint-maintainability`.

Use the `fallow` skill for project analysis, config, fixes, and CI gates. Install if missing:

```bash
npx skills add https://github.com/fallow-rs/fallow/tree/main/npm/fallow/skills/fallow --skill fallow
```

## Read for the Task

- Core rules: [`maintainability-equals-correctness`](./doctrine/foundations/maintainability-equals-correctness.md), [`resolve-uncertainty-into-contracts`](./doctrine/foundations/resolve-uncertainty-into-contracts.md), [`ssot-or-die`](./doctrine/abstractions/ssot-or-die.md), [`integration-first-testing`](./doctrine/testing/integration-first-testing.md), [`external-boundary-mocks-only`](./doctrine/testing/external-boundary-mocks-only.md), [`assert-observable-outcomes`](./doctrine/testing/assert-observable-outcomes.md)
- Cleanup/refactor: [`clean-up-what-you-touch`](./doctrine/deletion/clean-up-what-you-touch.md), [`delete-obsolete-code`](./doctrine/deletion/delete-obsolete-code.md), [`no-backwards-compat-shims`](./doctrine/deletion/no-backwards-compat-shims.md), [`delete-fake-layers`](./doctrine/deletion/delete-fake-layers.md), [`edit-real-owners`](./doctrine/deletion/edit-real-owners.md), [`build-deep-modules-not-shallow-abstractions`](./doctrine/abstractions/build-deep-modules-not-shallow-abstractions.md), [`cleanup-module-rewrite`](prompts/cleanup-module-rewrite.md), [`review-structural-slop`](prompts/review-structural-slop.md)
- Packages/boundaries: [`structure-typescript-apps-around-feature-owners`](./doctrine/abstractions/structure-typescript-apps-around-feature-owners.md), [`monorepo-package-boundaries`](./doctrine/packages/monorepo-package-boundaries.md), [`treat-critical-code-like-a-library`](./doctrine/foundations/treat-critical-code-like-a-library.md), [`naming-is-navigation`](./doctrine/foundations/naming-is-navigation.md), [`no-re-exports`](./doctrine/packages/no-re-exports.md)
- Stack/API/types: [`stack-overview`](./stack/stack-overview.md), [`design-openapi-for-inference`](./stack/design-openapi-for-inference.md), [`errors-are-schema`](./stack/errors-are-schema.md), [`document-fields-in-derived-zod-schemas`](./stack/document-fields-in-derived-zod-schemas.md), [`use-canonical-named-types`](./stack/use-canonical-named-types.md), [`jsdoc-with-first-party-sources`](./stack/jsdoc-with-first-party-sources.md), [`no-magic-values`](./stack/no-magic-values.md), [`use-branded-scalar-types`](./stack/use-branded-scalar-types.md)
- Testing/frontend/tooling: [`contract-gate-synthetic-fixtures`](./doctrine/testing/contract-gate-synthetic-fixtures.md), [`test-ai-apps-by-artifacts-not-prose`](./doctrine/testing/test-ai-apps-by-artifacts-not-prose.md), [`no-type-casts`](./doctrine/boundaries/no-type-casts.md), [`boundaries-validate-internals-trust`](./doctrine/boundaries/boundaries-validate-internals-trust.md), [`do-not-synchronize-state-with-useeffect`](./stack/do-not-synchronize-state-with-useeffect.md), [`use-the-design-system-not-ad-hoc-tailwind`](./stack/use-the-design-system-not-ad-hoc-tailwind.md), [`test-react-apps-in-real-browsers`](./stack/test-react-apps-in-real-browsers.md), [`maintainability-tooling`](./doctrine/tooling/maintainability-tooling.md)
- Editing this skill: read the files you touch, then run the bundled verification scripts.

## Audit workflow

For cleanup or review:

```bash
skill_dir="<path-to-this-skill>"
bash "$skill_dir/scripts/audit-typescript-repo.sh" .
```

Check real usage before acting on audit findings.

In Vite+ repos, use `vp lint`, `vp test`, `vp fmt`, `vp pack`, `vp add`, and `vp dlx`.

## Defaults

- Preserve contracts, tests, and invariants when changing structure.
- Delete stale code and wrappers. Keep behavior in its owning module.
- Resolve uncertainty in contracts before adding adapters or fallback behavior.
- Derive types and schemas. Test real integrations and observable outcomes; mock external boundaries only.
- Use Fallow for dead code, duplication, dependencies, health, cycles, and package boundaries.
