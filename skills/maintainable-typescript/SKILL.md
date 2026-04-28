---
name: maintainable-typescript
description: Guides maintainability-first cleanup, refactoring, and review in strict TypeScript repos and monorepos. Use when improving code health, deleting dead code, reducing duplication, or enforcing boundaries.
---

# Maintainable TypeScript

Use this skill when the project needs maintainability doctrine, not just local code changes.

## Layout

- [`doctrine/`](doctrine/) contains the portable rules and supporting guidance that should hold across strict TypeScript repos.
- [`stack/`](stack/) contains stack-specific doctrine for the opinionated Vite+ / Drizzle / oRPC / Cloudflare setup.
- [`prompts/`](prompts/) contains reusable prompt text for cleanup and review tasks when you need to steer another model away from wrapper-heavy refactors.
- [`scripts/`](scripts/) contains runnable TypeScript-repo audit helpers for dead code, duplicate code, and import-boundary problems in the current project.
- [`assets/tooling-templates/`](assets/tooling-templates/) contains copyable config templates for target repos.

## Reading order

Do not read the whole skill directory by default.

1. Read this file first.
2. Decide whether the task needs only portable rules or the full house stack.
3. Load only the doctrine files relevant to the task.
4. Treat the rest of the skill as reference material, not required context.

Default portable backbone:

- [`doctrine/foundations/maintainability-equals-correctness.md`](./doctrine/foundations/maintainability-equals-correctness.md)
- [`doctrine/abstractions/ssot-or-die.md`](./doctrine/abstractions/ssot-or-die.md)
- [`doctrine/testing/integration-first-testing.md`](./doctrine/testing/integration-first-testing.md)
- [`doctrine/testing/external-boundary-mocks-only.md`](./doctrine/testing/external-boundary-mocks-only.md)
- [`doctrine/testing/assert-observable-outcomes.md`](./doctrine/testing/assert-observable-outcomes.md)

If the repo matches the house stack, read [`stack/start-here.md`](./stack/start-here.md) before any stack-specific files.

## Task Router

Use the smallest relevant set.

### Cleanup, deletion, and refactor

- [`doctrine/foundations/maintainability-equals-correctness.md`](./doctrine/foundations/maintainability-equals-correctness.md)
- [`doctrine/foundations/write-for-the-agent-era.md`](./doctrine/foundations/write-for-the-agent-era.md)
- [`doctrine/deletion/clean-up-what-you-touch.md`](./doctrine/deletion/clean-up-what-you-touch.md)
- [`doctrine/deletion/delete-obsolete-code.md`](./doctrine/deletion/delete-obsolete-code.md)
- [`doctrine/deletion/no-backwards-compat-shims.md`](./doctrine/deletion/no-backwards-compat-shims.md)
- [`doctrine/deletion/delete-fake-layers.md`](./doctrine/deletion/delete-fake-layers.md)
- [`doctrine/deletion/edit-real-owners.md`](./doctrine/deletion/edit-real-owners.md)
- [`doctrine/abstractions/split-by-stable-seam.md`](./doctrine/abstractions/split-by-stable-seam.md)
- [`doctrine/foundations/your-pattern-will-be-copied.md`](./doctrine/foundations/your-pattern-will-be-copied.md)
- Prompt text for another model: [`prompts/cleanup-module-rewrite.md`](prompts/cleanup-module-rewrite.md) or [`prompts/review-structural-slop.md`](prompts/review-structural-slop.md)

### Package boundaries and shared runtime code

- [`doctrine/abstractions/split-by-stable-seam.md`](./doctrine/abstractions/split-by-stable-seam.md)
- [`doctrine/deletion/delete-fake-layers.md`](./doctrine/deletion/delete-fake-layers.md)
- [`doctrine/packages/monorepo-package-boundaries.md`](./doctrine/packages/monorepo-package-boundaries.md)
- [`doctrine/foundations/treat-critical-code-like-a-library.md`](./doctrine/foundations/treat-critical-code-like-a-library.md)
- [`doctrine/foundations/naming-is-navigation.md`](./doctrine/foundations/naming-is-navigation.md)
- [`doctrine/packages/no-re-exports.md`](./doctrine/packages/no-re-exports.md)
- [`doctrine/packages/no-barrel-exports.md`](./doctrine/packages/no-barrel-exports.md)

### API, schemas, and OpenAPI

- [`doctrine/abstractions/ssot-or-die.md`](./doctrine/abstractions/ssot-or-die.md)
- [`stack/design-openapi-for-inference.md`](./stack/design-openapi-for-inference.md)
- [`stack/errors-are-schema.md`](./stack/errors-are-schema.md)
- [`stack/document-fields-in-derived-zod-schemas.md`](./stack/document-fields-in-derived-zod-schemas.md)
- [`stack/use-canonical-named-types.md`](./stack/use-canonical-named-types.md)

### Types, constants, and documentation

- [`doctrine/abstractions/ssot-or-die.md`](./doctrine/abstractions/ssot-or-die.md)
- [`stack/jsdoc-with-first-party-sources.md`](./stack/jsdoc-with-first-party-sources.md)
- [`stack/no-magic-values.md`](./stack/no-magic-values.md)
- [`stack/use-branded-scalar-types.md`](./stack/use-branded-scalar-types.md)
- [`stack/use-canonical-named-types.md`](./stack/use-canonical-named-types.md)

### Testing and high-risk logic

- [`doctrine/testing/integration-first-testing.md`](./doctrine/testing/integration-first-testing.md)
- [`doctrine/testing/external-boundary-mocks-only.md`](./doctrine/testing/external-boundary-mocks-only.md)
- [`doctrine/testing/contract-gate-synthetic-fixtures.md`](./doctrine/testing/contract-gate-synthetic-fixtures.md)
- [`doctrine/testing/assert-observable-outcomes.md`](./doctrine/testing/assert-observable-outcomes.md)
- [`doctrine/testing/test-ai-apps-by-artifacts-not-prose.md`](./doctrine/testing/test-ai-apps-by-artifacts-not-prose.md)
- [`doctrine/foundations/treat-critical-code-like-a-library.md`](./doctrine/foundations/treat-critical-code-like-a-library.md)
- [`doctrine/boundaries/no-type-casts.md`](./doctrine/boundaries/no-type-casts.md)
- [`doctrine/boundaries/boundaries-validate-internals-trust.md`](./doctrine/boundaries/boundaries-validate-internals-trust.md)

### Frontend and React state

- [`stack/do-not-synchronize-state-with-useeffect.md`](./stack/do-not-synchronize-state-with-useeffect.md)
- [`doctrine/testing/external-boundary-mocks-only.md`](./doctrine/testing/external-boundary-mocks-only.md)
- [`doctrine/testing/contract-gate-synthetic-fixtures.md`](./doctrine/testing/contract-gate-synthetic-fixtures.md)
- [`stack/use-the-design-system-not-ad-hoc-tailwind.md`](./stack/use-the-design-system-not-ad-hoc-tailwind.md)
- [`stack/test-react-apps-in-real-browsers.md`](./stack/test-react-apps-in-real-browsers.md)

### Toolchain, dependencies, and database workflow

- [`stack/stack-overview.md`](./stack/stack-overview.md)
- [`stack/catalog-dependencies.md`](./stack/catalog-dependencies.md)
- [`stack/schema-migrations-are-generated.md`](./stack/schema-migrations-are-generated.md)
- [`doctrine/packages/use-mature-dependencies-dont-roll-your-own.md`](./doctrine/packages/use-mature-dependencies-dont-roll-your-own.md)
- [`doctrine/tooling/maintainability-tooling.md`](./doctrine/tooling/maintainability-tooling.md)

### Full doctrine review or editing this skill itself

- read all of [`doctrine/`](doctrine/)
- read all of [`stack/`](stack/)
- use the bundled verification scripts before finishing

## Audit workflow

When the task is cleanup or review, resolve the skill directory first and then run:

```bash
skill_dir="<path-to-this-skill>"
bash "$skill_dir/scripts/audit-typescript-repo.sh" .
```

Treat audit output as signal, not authority. Check real usage before deleting API surface or collapsing a pattern.

If the target repo is Vite+, use `vp` for the normal toolchain entrypoint: `vp lint`, `vp test`, `vp fmt`, `vp pack`, `vp add`, and `vp dlx`.

## Defaults

- Code is cheap. Structure is expensive.
- Preserve contracts, tests, and invariants, not stale decomposition.
- Prefer deletion over shims.
- Prefer stable subsystem files over one-helper-per-file trees.
- Prefer derived types and schemas over handwritten duplicates.
- Prefer durable tests that attach regressions to real product boundaries.
- Prefer slice integration tests over internally mocked unit tests.
- Prefer mocking only external systems you do not control.
- Prefer contract-gated synthetic fixtures over handwritten unchecked JSON.
- Prefer assertions on rendered output, HTTP behavior, persisted state, and published artifacts over helper call order.
- Prefer mature tooling for dead code, duplication, and dependency boundaries over manual inspection.
- Prefer making the codebase more coherent now over promising to clean it up later.
