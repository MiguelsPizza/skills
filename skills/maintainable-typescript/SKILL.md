---
name: maintainable-typescript
description: Guides maintainability-first cleanup, refactoring, and review in strict TypeScript repos and monorepos. Use when improving code health, deleting dead code, reducing duplication, or enforcing boundaries.
---

# Maintainable TypeScript

Use this skill when the project needs maintainability doctrine, not just local code changes.

## Layout

- [`references/`](references/) contains the portable rules and supporting guidance that should hold across strict TypeScript repos.
- [`opinionated-stack/`](opinionated-stack/) contains stack-specific doctrine for the opinionated Vite+ / Drizzle / oRPC / Cloudflare setup.
- [`scripts/`](scripts/) contains runnable TypeScript-repo audit helpers for dead code, duplicate code, and import-boundary problems in the current project.
- [`assets/tooling-templates/`](assets/tooling-templates/) contains copyable config templates for target repos.

## Reading order

Do not read the whole skill directory by default.

1. Read this file first.
2. Decide whether the task needs only portable rules or the full house stack.
3. Load only the doctrine files relevant to the task.
4. Treat the rest of the skill as reference material, not required context.

Default portable backbone:

- [`references/maintainability-equals-correctness.md`](references/maintainability-equals-correctness.md)
- [`references/ssot-or-die.md`](references/ssot-or-die.md)
- [`references/integration-first-testing.md`](references/integration-first-testing.md)

If the repo matches the house stack, read [`opinionated-stack/start-here.md`](opinionated-stack/start-here.md) before any stack-specific files.

## Task Router

Use the smallest relevant set.

### Cleanup, deletion, and refactor

- [`references/maintainability-equals-correctness.md`](references/maintainability-equals-correctness.md)
- [`references/clean-up-what-you-touch.md`](references/clean-up-what-you-touch.md)
- [`references/delete-obsolete-code.md`](references/delete-obsolete-code.md)
- [`references/no-backwards-compat-shims.md`](references/no-backwards-compat-shims.md)
- [`references/split-by-stable-seam.md`](references/split-by-stable-seam.md)
- [`references/your-pattern-will-be-copied.md`](references/your-pattern-will-be-copied.md)

### Package boundaries and shared runtime code

- [`references/split-by-stable-seam.md`](references/split-by-stable-seam.md)
- [`references/monorepo-package-boundaries.md`](references/monorepo-package-boundaries.md)
- [`references/treat-critical-code-like-a-library.md`](references/treat-critical-code-like-a-library.md)
- [`references/naming-is-navigation.md`](references/naming-is-navigation.md)
- [`references/no-re-exports.md`](references/no-re-exports.md)
- [`references/no-barrel-exports.md`](references/no-barrel-exports.md)

### API, schemas, and OpenAPI

- [`references/ssot-or-die.md`](references/ssot-or-die.md)
- [`opinionated-stack/design-openapi-for-inference.md`](opinionated-stack/design-openapi-for-inference.md)
- [`opinionated-stack/errors-are-schema.md`](opinionated-stack/errors-are-schema.md)
- [`opinionated-stack/document-fields-in-derived-zod-schemas.md`](opinionated-stack/document-fields-in-derived-zod-schemas.md)
- [`opinionated-stack/use-canonical-named-types.md`](opinionated-stack/use-canonical-named-types.md)

### Types, constants, and documentation

- [`references/ssot-or-die.md`](references/ssot-or-die.md)
- [`opinionated-stack/jsdoc-with-first-party-sources.md`](opinionated-stack/jsdoc-with-first-party-sources.md)
- [`opinionated-stack/no-magic-values.md`](opinionated-stack/no-magic-values.md)
- [`opinionated-stack/use-branded-scalar-types.md`](opinionated-stack/use-branded-scalar-types.md)
- [`opinionated-stack/use-canonical-named-types.md`](opinionated-stack/use-canonical-named-types.md)

### Testing and high-risk logic

- [`references/integration-first-testing.md`](references/integration-first-testing.md)
- [`references/treat-critical-code-like-a-library.md`](references/treat-critical-code-like-a-library.md)
- [`references/no-type-casts.md`](references/no-type-casts.md)
- [`references/boundaries-validate-internals-trust.md`](references/boundaries-validate-internals-trust.md)

### Frontend and React state

- [`opinionated-stack/do-not-synchronize-state-with-useeffect.md`](opinionated-stack/do-not-synchronize-state-with-useeffect.md)
- [`opinionated-stack/use-the-design-system-not-ad-hoc-tailwind.md`](opinionated-stack/use-the-design-system-not-ad-hoc-tailwind.md)
- [`opinionated-stack/test-react-apps-in-real-browsers.md`](opinionated-stack/test-react-apps-in-real-browsers.md)

### Toolchain, dependencies, and database workflow

- [`opinionated-stack/stack-overview.md`](opinionated-stack/stack-overview.md)
- [`opinionated-stack/catalog-dependencies.md`](opinionated-stack/catalog-dependencies.md)
- [`opinionated-stack/schema-migrations-are-generated.md`](opinionated-stack/schema-migrations-are-generated.md)
- [`references/use-mature-dependencies-dont-roll-your-own.md`](references/use-mature-dependencies-dont-roll-your-own.md)
- [`references/maintainability-tooling.md`](references/maintainability-tooling.md)

### Full doctrine review or editing this skill itself

- read all of [`references/`](references/)
- read all of [`opinionated-stack/`](opinionated-stack/)
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

- Prefer deletion over shims.
- Prefer stable subsystem files over one-helper-per-file trees.
- Prefer derived types and schemas over handwritten duplicates.
- Prefer slice integration tests over internally mocked unit tests.
- Prefer mature tooling for dead code, duplication, and dependency boundaries over manual inspection.
- Prefer making the codebase more coherent now over promising to clean it up later.
