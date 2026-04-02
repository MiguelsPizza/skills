# Maintainable TypeScript

Maintainability-first doctrine for strict TypeScript repos and monorepos.

## Why This Exists

Coding agents optimize for "works right now." This skill is meant to push them toward "leave the repo easier to change next month."

The doctrine is opinionated on purpose. It treats maintainability as a correctness concern, not as polish to add later.

## What's In Here

- [SKILL.md](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/SKILL.md) is the skill entrypoint.
- [references/](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references) contains portable rules for strict TypeScript repos.
- [opinionated-stack/](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack) contains stack-specific doctrine for the Vite+ / TanStack Router / Drizzle / oRPC / Cloudflare architecture.
- [scripts/](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/scripts) contains bundled audit helpers for dead code, duplicate code, and architecture checks.
- [assets/tooling-templates/](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/assets/tooling-templates) contains copyable config templates for target repos.

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

This repo ships [plugin.json](/Users/alexmnahas/personalRepos/agent-opinions/.claude-plugin/plugin.json) and [marketplace.json](/Users/alexmnahas/personalRepos/agent-opinions/.claude-plugin/marketplace.json) at the repo root, so Claude Code can install it as a plugin.

**Claude.ai standalone skill**

1. Download the published `maintainable-typescript.zip` archive
2. Go to **Customize > Skills**
3. Upload that ZIP

**Build the ZIP locally**

```bash
./scripts/build-skill-archive.sh
```

That regenerates [skills/maintainable-typescript.zip](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript.zip) from [skills/maintainable-typescript/](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript).

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

If you are working from this repo instead of the standalone skill archive, the same files also exist in [tooling/templates/](/Users/alexmnahas/personalRepos/agent-opinions/tooling/templates) and are documented in [tooling/README.md](/Users/alexmnahas/personalRepos/agent-opinions/tooling/README.md).

## Opinions Index

### Portable Rules

**Cleanup & Deletion**
- [Delete Obsolete Code](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/delete-obsolete-code.md)
- [No Backwards Compatibility Shims](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/no-backwards-compat-shims.md)
- [No Unused Exports](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/no-unused-exports.md)
- [Clean Up What You Touch](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/clean-up-what-you-touch.md)

**Error Handling**
- [Error Messages Are UX](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/error-messages-are-ux.md)
- [Log at Boundaries, Not Everywhere](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/log-at-boundaries-not-everywhere.md)
- [No Defensive Catches](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/no-defensive-catches.md)
- [No Defensive Null Checks](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/no-defensive-null-checks.md)
- [Boundaries Validate, Internals Trust](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/boundaries-validate-internals-trust.md)

**Abstractions & Architecture**
- [No Premature Abstractions](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/no-premature-abstractions.md)
- [No Speculative Configuration](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/no-speculative-configuration.md)
- [Keep Schemas Minimal](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/keep-schemas-minimal.md)
- [Assign Cache Invalidation Owners](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/assign-cache-invalidation-owners.md)
- [SSOT or Die](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/ssot-or-die.md)

**Dependencies & Libraries**
- [Use Mature Dependencies, Don't Roll Your Own](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/use-mature-dependencies-dont-roll-your-own.md)

**Code Quality**
- [Naming Is Navigation](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/naming-is-navigation.md)
- [One Concept Per File](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/one-concept-per-file.md)
- [Comments Say Why Not What](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/comments-say-why-not-what.md)
- [Commit Messages Describe Why](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/commit-messages-describe-why.md)
- [Atomic Changes](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/atomic-changes.md)
- [Maintainability Equals Correctness](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/maintainability-equals-correctness.md)
- [Treat Critical Code Like a Library](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/treat-critical-code-like-a-library.md)

**Agent-Specific**
- [Your Pattern Will Be Copied](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/your-pattern-will-be-copied.md)
- [Bounded Behavior](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/bounded-behavior.md)

**Testing**
- [Integration-First Testing](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/integration-first-testing.md)
- [No Type Casts](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/no-type-casts.md)

**Monorepo & Package Structure**
- [No Re-exports](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/no-re-exports.md)
- [No Barrel Exports](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/no-barrel-exports.md)
- [Monorepo Package Boundaries](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/references/monorepo-package-boundaries.md)

### Opinionated Stack

**Start Here**
- [Start Here](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/start-here.md)
- [Opinionated Stack Overview](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/stack-overview.md)

**Error Handling & API Design**
- [Design OpenAPI for Inference](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/design-openapi-for-inference.md)
- [Errors Are Schema, Not Strings](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/errors-are-schema.md)

**Types & Schemas**
- [Comments and JSDoc Must Carry Information](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/jsdoc-with-first-party-sources.md)
- [Document Fields in Derived Zod Schemas](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/document-fields-in-derived-zod-schemas.md)
- [No Magic Values](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/no-magic-values.md)
- [Use Branded Scalar Types](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/use-branded-scalar-types.md)
- [Use Canonical Named Types, Not Inline Object Shapes](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/use-canonical-named-types.md)

**Observability**
- [OTEL Conventions from Day One](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/otel-conventions-from-day-one.md)

**Dependencies & Toolchain**
- [Catalog Dependencies](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/catalog-dependencies.md)

**Monorepo & Database**
- [Schema Migrations Are Generated](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/schema-migrations-are-generated.md)

**Testing**
- [Test React Apps in Real Browsers](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/test-react-apps-in-real-browsers.md)

**Frontend & Design System**
- [Do Not Use Next.js](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/do-not-use-nextjs.md)
- [Do Not Synchronize State with useEffect](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/do-not-synchronize-state-with-useeffect.md)
- [Use the Design System, Not Ad Hoc Tailwind](/Users/alexmnahas/personalRepos/agent-opinions/skills/maintainable-typescript/opinionated-stack/use-the-design-system-not-ad-hoc-tailwind.md)

## Contributing

See [AGENTS.md](/Users/alexmnahas/personalRepos/agent-opinions/AGENTS.md) for the contributor guide and repository rules.
