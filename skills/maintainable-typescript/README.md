# Maintainable TypeScript

Maintainability-first doctrine for strict TypeScript repos and monorepos.

## Why This Exists

Coding agents optimize for "works right now." This skill is meant to push them toward "leave the repo easier to change next month."

The doctrine is opinionated on purpose. It treats maintainability as a correctness concern, not as polish to add later.
In the agent era, code generation is cheap. Reviewer attention, conceptual stability, and truthful structure are not.

## What's In Here

- [SKILL.md](SKILL.md) is the skill entrypoint.
- [doctrine/](doctrine) contains portable rules for strict TypeScript repos, grouped by concept.
- [stack/](stack) contains stack-specific doctrine for the Vite+ / TanStack Router / Drizzle / oRPC / Cloudflare architecture.
- [prompts/](prompts) contains reusable prompt text for cleanup, review, and refactor tasks that need to fight default agent behavior.
- [scripts/](scripts) contains bundled audit helpers for dead code, duplicate code, and architecture checks.
- [assets/tooling-templates/](assets/tooling-templates) contains copyable config templates for target repos.

## Install

**Vercel Skills CLI**

```bash
npx skills add miguelspizza/skills --skill maintainable-typescript
```

This works with any agent that supports skills (Claude Code, Cursor, etc.). Use `--list` to see all available skills in this repo, or `--all` to install everything:

```bash
npx skills add miguelspizza/skills --list
npx skills add miguelspizza/skills --all
```

**Claude Code plugin**

```text
/plugin marketplace add miguelspizza/skills
/plugin install skills@miguelspizza-skills
```

This repo ships [plugin.json](../../.claude-plugin/plugin.json) and [marketplace.json](../../.claude-plugin/marketplace.json) at the repo root, so Claude Code can install it as a plugin.

**Claude.ai standalone skill**

1. Download the published `maintainable-typescript.zip` archive
2. Go to **Customize > Skills**
3. Upload that ZIP

**Build the ZIP locally**

```bash
./scripts/build-skill-archive.sh
```

That regenerates [skills/maintainable-typescript.zip](../../skills/maintainable-typescript.zip) from [skills/maintainable-typescript/](../../skills/maintainable-typescript).

## Use Without The Skill

You can reference this doctrine from your own `AGENTS.md` or `CLAUDE.md`, or copy individual files into another repo and adapt them.

## Use The TypeScript Tooling

The tooling templates are independent of the skill. In the standalone skill archive, they live under `assets/tooling-templates/`:

```bash
cp assets/tooling-templates/.knip.json .
cp assets/tooling-templates/.dependency-cruiser.mjs .
cp assets/tooling-templates/.jscpd.json .
cp assets/tooling-templates/sgconfig.yml .
cp -r assets/tooling-templates/ast-grep/ .

pnpm add -D knip dependency-cruiser jscpd @ast-grep/cli oxlint typescript

bash scripts/audit-typescript-repo.sh .
```

If the target repo already uses Vite+, prefer its `vp` commands for linting, formatting, and testing instead of installing wrapped tool binaries just to reach them.

If you are working from this repo instead of the standalone skill archive, the same files also exist in [tooling/templates/](../../tooling/templates) and are documented in [tooling/README.md](../../tooling/README.md).

## Opinions Index

### Portable Rules

**Cleanup & Deletion**
- [Delete Obsolete Code](./doctrine/deletion/delete-obsolete-code.md)
- [No Backwards Compatibility Shims](./doctrine/deletion/no-backwards-compat-shims.md)
- [Clean Up What You Touch](./doctrine/deletion/clean-up-what-you-touch.md)

**Error Handling**
- [Error Messages Are UX](./doctrine/boundaries/error-messages-are-ux.md)
- [Log at Boundaries, Not Everywhere](./doctrine/boundaries/log-at-boundaries-not-everywhere.md)
- [No Defensive Catches](./doctrine/boundaries/no-defensive-catches.md)
- [No Defensive Null Checks](./doctrine/boundaries/no-defensive-null-checks.md)
- [Boundaries Validate, Internals Trust](./doctrine/boundaries/boundaries-validate-internals-trust.md)

**Abstractions & Architecture**
- [Split By Stable Seam](./doctrine/abstractions/split-by-stable-seam.md)
- [No Premature Abstractions](./doctrine/abstractions/no-premature-abstractions.md)
- [Delete Fake Layers](./doctrine/deletion/delete-fake-layers.md)
- [Design Around Composable Primitives](./doctrine/abstractions/design-around-composable-primitives.md)
- [Keep a Functional Core and Imperative Shell](./doctrine/abstractions/keep-a-functional-core-and-imperative-shell.md)
- [Pass Values Across Boundaries](./doctrine/boundaries/pass-values-across-boundaries.md)
- [Build Deep Modules, Not Shallow Abstractions](./doctrine/abstractions/build-deep-modules-not-shallow-abstractions.md)
- [Edit Real Owners](./doctrine/deletion/edit-real-owners.md)
- [Compose Behavior, Do Not Specialize Classes](./doctrine/abstractions/compose-behavior-do-not-specialize-classes.md)
- [Use Classes for Object APIs, Not Service Buckets](./doctrine/abstractions/use-classes-for-object-apis-not-service-buckets.md)
- [Make Builders Earn Their Keep](./doctrine/abstractions/make-builders-earn-their-keep.md)
- [Keep Schemas Minimal](./doctrine/abstractions/keep-schemas-minimal.md)
- [Assign Cache Invalidation Owners](./doctrine/boundaries/assign-cache-invalidation-owners.md)
- [SSOT or Die](./doctrine/abstractions/ssot-or-die.md)

**Dependencies & Libraries**
- [Use Mature Dependencies, Don't Roll Your Own](./doctrine/packages/use-mature-dependencies-dont-roll-your-own.md)

**Tooling**
- [Maintainability Tooling](./doctrine/tooling/maintainability-tooling.md)

**Code Quality**
- [Naming Is Navigation](./doctrine/foundations/naming-is-navigation.md)
- [Comments Say Why Not What](./doctrine/foundations/comments-say-why-not-what.md)
- [Commit Messages Describe Why](./doctrine/foundations/commit-messages-describe-why.md)
- [Atomic Changes](./doctrine/foundations/atomic-changes.md)
- [Maintainability Equals Correctness](./doctrine/foundations/maintainability-equals-correctness.md)
- [Treat Critical Code Like a Library](./doctrine/foundations/treat-critical-code-like-a-library.md)

**Agent-Specific**
- [Write for the Agent Era](./doctrine/foundations/write-for-the-agent-era.md)
- [Your Pattern Will Be Copied](./doctrine/foundations/your-pattern-will-be-copied.md)
- [Bounded Behavior](./doctrine/foundations/bounded-behavior.md)

**Testing**
- [Integration-First Testing](./doctrine/testing/integration-first-testing.md)
- [Mock External Boundaries Only](./doctrine/testing/external-boundary-mocks-only.md)
- [Contract-Gate Synthetic Fixtures](./doctrine/testing/contract-gate-synthetic-fixtures.md)
- [Assert Observable Outcomes](./doctrine/testing/assert-observable-outcomes.md)
- [Test AI Apps by Artifacts, Not Prose](./doctrine/testing/test-ai-apps-by-artifacts-not-prose.md)
- [No Type Casts](./doctrine/boundaries/no-type-casts.md)

**Monorepo & Package Structure**
- [No Re-exports](./doctrine/packages/no-re-exports.md)
- [No Barrel Exports](./doctrine/packages/no-barrel-exports.md)
- [Monorepo Package Boundaries](./doctrine/packages/monorepo-package-boundaries.md)

### Opinionated Stack

**Start Here**
- [Start Here](./stack/start-here.md)
- [Opinionated Stack Overview](./stack/stack-overview.md)

**Error Handling & API Design**
- [Design OpenAPI for Inference](./stack/design-openapi-for-inference.md)
- [Errors Are Schema, Not Strings](./stack/errors-are-schema.md)

**Types & Schemas**
- [Comments and JSDoc Must Carry Information](./stack/jsdoc-with-first-party-sources.md)
- [Document Fields in Derived Zod Schemas](./stack/document-fields-in-derived-zod-schemas.md)
- [No Magic Values](./stack/no-magic-values.md)
- [Use Branded Scalar Types](./stack/use-branded-scalar-types.md)
- [Use Canonical Named Types, Not Inline Object Shapes](./stack/use-canonical-named-types.md)

**Observability**
- [OTEL Conventions from Day One](./stack/otel-conventions-from-day-one.md)

**Dependencies & Toolchain**
- [Catalog Dependencies](./stack/catalog-dependencies.md)

**Monorepo & Database**
- [Schema Migrations Are Generated](./stack/schema-migrations-are-generated.md)

**Testing**
- [Test React Apps in Real Browsers](./stack/test-react-apps-in-real-browsers.md)

**Frontend & Design System**
- [Do Not Use Next.js](./stack/do-not-use-nextjs.md)
- [Do Not Synchronize State with useEffect](./stack/do-not-synchronize-state-with-useeffect.md)
- [Use the Design System, Not Ad Hoc Tailwind](./stack/use-the-design-system-not-ad-hoc-tailwind.md)

## Prompt Assets

- [Cleanup Module Rewrite](prompts/cleanup-module-rewrite.md)
- [Review Structural Slop](prompts/review-structural-slop.md)

## Contributing

See [AGENTS.md](../../AGENTS.md) for the contributor guide and repository rules.
