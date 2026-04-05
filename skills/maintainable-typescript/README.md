# Maintainable TypeScript

Maintainability-first doctrine for strict TypeScript repos and monorepos.

## Why This Exists

Coding agents optimize for "works right now." This skill is meant to push them toward "leave the repo easier to change next month."

The doctrine is opinionated on purpose. It treats maintainability as a correctness concern, not as polish to add later.

## What's In Here

- [SKILL.md](SKILL.md) is the skill entrypoint.
- [references/](references) contains portable rules for strict TypeScript repos.
- [opinionated-stack/](opinionated-stack) contains stack-specific doctrine for the Vite+ / TanStack Router / Drizzle / oRPC / Cloudflare architecture.
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
- [Delete Obsolete Code](references/delete-obsolete-code.md)
- [No Backwards Compatibility Shims](references/no-backwards-compat-shims.md)
- [No Unused Exports](references/no-unused-exports.md)
- [Clean Up What You Touch](references/clean-up-what-you-touch.md)

**Error Handling**
- [Error Messages Are UX](references/error-messages-are-ux.md)
- [Log at Boundaries, Not Everywhere](references/log-at-boundaries-not-everywhere.md)
- [No Defensive Catches](references/no-defensive-catches.md)
- [No Defensive Null Checks](references/no-defensive-null-checks.md)
- [Boundaries Validate, Internals Trust](references/boundaries-validate-internals-trust.md)

**Abstractions & Architecture**
- [Split By Stable Seam](references/split-by-stable-seam.md)
- [No Premature Abstractions](references/no-premature-abstractions.md)
- [No Speculative Configuration](references/no-speculative-configuration.md)
- [Keep Schemas Minimal](references/keep-schemas-minimal.md)
- [Assign Cache Invalidation Owners](references/assign-cache-invalidation-owners.md)
- [SSOT or Die](references/ssot-or-die.md)

**Dependencies & Libraries**
- [Use Mature Dependencies, Don't Roll Your Own](references/use-mature-dependencies-dont-roll-your-own.md)

**Code Quality**
- [Naming Is Navigation](references/naming-is-navigation.md)
- [Comments Say Why Not What](references/comments-say-why-not-what.md)
- [Commit Messages Describe Why](references/commit-messages-describe-why.md)
- [Atomic Changes](references/atomic-changes.md)
- [Maintainability Equals Correctness](references/maintainability-equals-correctness.md)
- [Treat Critical Code Like a Library](references/treat-critical-code-like-a-library.md)

**Agent-Specific**
- [Your Pattern Will Be Copied](references/your-pattern-will-be-copied.md)
- [Bounded Behavior](references/bounded-behavior.md)

**Testing**
- [Integration-First Testing](references/integration-first-testing.md)
- [No Type Casts](references/no-type-casts.md)

**Monorepo & Package Structure**
- [No Re-exports](references/no-re-exports.md)
- [No Barrel Exports](references/no-barrel-exports.md)
- [Monorepo Package Boundaries](references/monorepo-package-boundaries.md)

### Opinionated Stack

**Start Here**
- [Start Here](opinionated-stack/start-here.md)
- [Opinionated Stack Overview](opinionated-stack/stack-overview.md)

**Error Handling & API Design**
- [Design OpenAPI for Inference](opinionated-stack/design-openapi-for-inference.md)
- [Errors Are Schema, Not Strings](opinionated-stack/errors-are-schema.md)

**Types & Schemas**
- [Comments and JSDoc Must Carry Information](opinionated-stack/jsdoc-with-first-party-sources.md)
- [Document Fields in Derived Zod Schemas](opinionated-stack/document-fields-in-derived-zod-schemas.md)
- [No Magic Values](opinionated-stack/no-magic-values.md)
- [Use Branded Scalar Types](opinionated-stack/use-branded-scalar-types.md)
- [Use Canonical Named Types, Not Inline Object Shapes](opinionated-stack/use-canonical-named-types.md)

**Observability**
- [OTEL Conventions from Day One](opinionated-stack/otel-conventions-from-day-one.md)

**Dependencies & Toolchain**
- [Catalog Dependencies](opinionated-stack/catalog-dependencies.md)

**Monorepo & Database**
- [Schema Migrations Are Generated](opinionated-stack/schema-migrations-are-generated.md)

**Testing**
- [Test React Apps in Real Browsers](opinionated-stack/test-react-apps-in-real-browsers.md)

**Frontend & Design System**
- [Do Not Use Next.js](opinionated-stack/do-not-use-nextjs.md)
- [Do Not Synchronize State with useEffect](opinionated-stack/do-not-synchronize-state-with-useeffect.md)
- [Use the Design System, Not Ad Hoc Tailwind](opinionated-stack/use-the-design-system-not-ad-hoc-tailwind.md)

## Contributing

See [AGENTS.md](../../AGENTS.md) for the contributor guide and repository rules.
