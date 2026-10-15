# Maintainable TypeScript

Rules for strict TypeScript repos and monorepos. Keep code correct, easy to find, and easy to change.

## What's In Here

- [SKILL.md](SKILL.md) is the skill entrypoint.
- [doctrine/](doctrine): portable TypeScript rules.
- [stack/](stack): rules for Vite+, TanStack Router, Drizzle, oRPC, and Cloudflare.
- [prompts/](prompts): cleanup, review, and refactor prompts.
- [scripts/](scripts): dead code, duplication, and architecture audits.
- [assets/tooling-templates/](assets/tooling-templates): copyable config.

## Install

**Vercel Skills CLI**

```bash
npx skills add miguelspizza/skills --skill maintainable-typescript
```

Use with any agent that supports skills. List or install all skills:

```bash
npx skills add miguelspizza/skills --list
npx skills add miguelspizza/skills --all
```

**Claude Code plugin**

```text
/plugin marketplace add miguelspizza/skills
/plugin install skills@miguelspizza-skills
```

Plugin files: [plugin.json](../../.claude-plugin/plugin.json) and [marketplace.json](../../.claude-plugin/marketplace.json).

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

Link these rules from `AGENTS.md` or `CLAUDE.md`, or copy individual files into your repo.

## Use The TypeScript Tooling

Copyable templates live in `assets/tooling-templates/`. To run the audit tools:

```bash
pnpm add -D fallow typescript

bash scripts/audit-typescript-repo.sh .
```

Run Fallow without config first. Add `assets/tooling-templates/.fallowrc.json` when you need severities, ignores, boundaries, thresholds, or baselines.

In Vite+ repos, use `vp` for linting, formatting, testing, and package operations.

Add local rules to the existing linter and formatter config.

Install [Oxlint Maintainability](../oxlint-maintainability/SKILL.md) for lint enforcement. Read its [coverage map](../oxlint-maintainability/references/coverage.md) before enabling optional presets or acting on wrapper and shape warnings.

Repository copies: [tooling/templates/](../../tooling/templates) and [tooling/README.md](../../tooling/README.md).

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
- [Build Deep Modules, Not Shallow Abstractions](./doctrine/abstractions/build-deep-modules-not-shallow-abstractions.md)
- [Structure TypeScript Apps Around Feature Owners](./doctrine/abstractions/structure-typescript-apps-around-feature-owners.md)
- [No Premature Abstractions](./doctrine/abstractions/no-premature-abstractions.md)
- [Delete Fake Layers](./doctrine/deletion/delete-fake-layers.md)
- [Design Around Composable Primitives](./doctrine/abstractions/design-around-composable-primitives.md)
- [Keep a Functional Core and Imperative Shell](./doctrine/abstractions/keep-a-functional-core-and-imperative-shell.md)
- [Pass Values Across Boundaries](./doctrine/boundaries/pass-values-across-boundaries.md)
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
- [Resolve Uncertainty Into Contracts](./doctrine/foundations/resolve-uncertainty-into-contracts.md)
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
