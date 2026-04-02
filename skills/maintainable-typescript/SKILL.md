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

1. Start with the relevant files in [`references/`](references/).
2. If the repo matches the house stack, read [`opinionated-stack/start-here.md`](opinionated-stack/start-here.md) first, then the specific files in [`opinionated-stack/`](opinionated-stack/).
3. Use [`references/maintainability-equals-correctness.md`](references/maintainability-equals-correctness.md), [`references/ssot-or-die.md`](references/ssot-or-die.md), and [`references/integration-first-testing.md`](references/integration-first-testing.md) as the default backbone.
4. Pull in narrower files only when the task actually touches that doctrine.

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
- Prefer derived types and schemas over handwritten duplicates.
- Prefer slice integration tests over internally mocked unit tests.
- Prefer mature tooling for dead code, duplication, and dependency boundaries over manual inspection.
- Prefer making the codebase more coherent now over promising to clean it up later.
