# Agent Opinions

Opinionated rules that make AI coding agents write maintainable code instead of disposable code.

## Why this exists

Claude Code's source code was recently leaked. 500,000 lines of TypeScript across thousands of files. The whole thing was vibe-coded — built iteratively with Claude Code itself as the models got smarter over time. The result was what you'd expect: dead code everywhere, hundreds of helper files (many unused or duplicated), functions commented out but still shipped, `as any` scattered throughout, and no coherent architecture holding it together.

This is the team that *makes* the model. If they can't prevent agent-driven codebase decay, nobody gets it for free.

I've spent the last year bashing my head against coding agents, trying to get them to write code I'd actually want to maintain. The default behavior is always the same: agents optimize for "make it work right now" at the cost of everything that matters six months later. They leave dead code because removing it might break something. They add compatibility shims instead of making clean changes. They wrap everything in defensive try/catch blocks. They create abstractions for things that happen once.

These are the opinions I've written down — 44 rules I use across my own projects to push back on those defaults. They treat maintainability as equal priority to working code. They're specific, actionable, and designed for the way agents actually fail.

## What's in here

**`opinions/`** is an uploadable [Claude Skill](https://github.com/anthropics/agent-skills-spec) with two tiers:

- **`opinions/references/`** — 30 portable rules for any strict TypeScript repo. Things like "delete obsolete code," "no defensive null checks," "boundaries validate, internals trust." These survive a stack change.

- **`opinions/opinionated-stack/`** — 14 stack-specific rules for a Vite+ / TanStack Router / Drizzle / oRPC / Cloudflare architecture. Things like "errors are schema, not strings," "test React apps in real browsers," "do not use Next.js." These assume the house stack.

**`tooling/`** — Portable config templates for dead code detection (knip), circular dependency enforcement (dependency-cruiser), duplicate code reporting (jscpd), and custom AST rules (ast-grep). Copy them into any TypeScript repo.

**`scripts/`** — Repo maintenance scripts that validate opinion structure, example metadata, duplicate prose, and markdown links.

**`how-to-write-skill-guide/`** — Anthropic's official guide to building skills for Claude, converted to Markdown for reference.

## Install as a Claude Skill

Download the `opinions/` folder and upload it to Claude:

**Claude.ai:**
1. Download or clone this repo
2. Go to **Settings > Capabilities > Skills**
3. Upload the `opinions/` folder (or zip it first)

**Claude Code:**
```bash
# Clone and reference directly
git clone https://github.com/miguelspizza/agent-opinions.git ~/.claude/skills/agent-opinions
```

The skill's entry point is [`opinions/SKILL.md`](opinions/SKILL.md). Claude will load the portable rules by default, and pull in stack-specific doctrine when the task touches architecture, framework choice, or toolchain decisions.

## Use without the skill

You don't need the skill system. Reference individual opinions in your project's `AGENTS.md` or `CLAUDE.md`:

```md
# AGENTS.md
Follow the opinions in https://github.com/miguelspizza/agent-opinions
```

Or copy specific files into your repo and adapt them. The opinions are standalone markdown — they work anywhere an agent reads instructions.

## Use the TypeScript tooling

The tooling templates are independent of the opinions. Copy them into any TypeScript repo:

```bash
# Copy configs to your repo root
cp tooling/templates/.knip.json .
cp tooling/templates/.dependency-cruiser.mjs .
cp tooling/templates/.jscpd.json .
cp tooling/templates/sgconfig.yml .
cp -r tooling/templates/ast-grep/ .

# Install the tools
pnpm add -D knip dependency-cruiser jscpd @ast-grep/cli oxlint typescript

# Run the audit
bash scripts/audit-typescript-repo.sh .
```

See [`tooling/README.md`](tooling/README.md) for configuration details and suggested package.json scripts.

## Opinions index

### Portable Rules (`references/`)

**Cleanup & Deletion**
- [Delete Obsolete Code](opinions/references/delete-obsolete-code.md)
- [No Backwards Compatibility Shims](opinions/references/no-backwards-compat-shims.md)
- [No Unused Exports](opinions/references/no-unused-exports.md)
- [Clean Up What You Touch](opinions/references/clean-up-what-you-touch.md)

**Error Handling**
- [Error Messages Are UX](opinions/references/error-messages-are-ux.md)
- [Log at Boundaries, Not Everywhere](opinions/references/log-at-boundaries-not-everywhere.md)
- [No Defensive Catches](opinions/references/no-defensive-catches.md)
- [No Defensive Null Checks](opinions/references/no-defensive-null-checks.md)
- [Boundaries Validate, Internals Trust](opinions/references/boundaries-validate-internals-trust.md)

**Abstractions & Architecture**
- [No Premature Abstractions](opinions/references/no-premature-abstractions.md)
- [No Speculative Configuration](opinions/references/no-speculative-configuration.md)
- [Keep Schemas Minimal](opinions/references/keep-schemas-minimal.md)
- [Assign Cache Invalidation Owners](opinions/references/assign-cache-invalidation-owners.md)
- [SSOT or Die](opinions/references/ssot-or-die.md)

**Dependencies & Libraries**
- [Use Mature Dependencies, Don't Roll Your Own](opinions/references/use-mature-dependencies-dont-roll-your-own.md)

**Code Quality**
- [Naming Is Navigation](opinions/references/naming-is-navigation.md)
- [One Concept Per File](opinions/references/one-concept-per-file.md)
- [Comments Say Why Not What](opinions/references/comments-say-why-not-what.md)
- [Commit Messages Describe Why](opinions/references/commit-messages-describe-why.md)
- [Atomic Changes](opinions/references/atomic-changes.md)
- [Maintainability Equals Correctness](opinions/references/maintainability-equals-correctness.md)

**Agent-Specific**
- [Your Pattern Will Be Copied](opinions/references/your-pattern-will-be-copied.md)
- [Bounded Behavior](opinions/references/bounded-behavior.md)

**Testing**
- [Integration-First Testing](opinions/references/integration-first-testing.md)
- [No Type Casts](opinions/references/no-type-casts.md)

**Monorepo & Package Structure**
- [No Re-exports](opinions/references/no-re-exports.md)
- [No Barrel Exports](opinions/references/no-barrel-exports.md)
- [Monorepo Package Boundaries](opinions/references/monorepo-package-boundaries.md)

### Opinionated Stack (`opinionated-stack/`)

**Start Here**
- [Start Here](opinions/opinionated-stack/start-here.md)
- [Opinionated Stack Overview](opinions/opinionated-stack/stack-overview.md)

**Error Handling & API Design**
- [Errors Are Schema, Not Strings](opinions/opinionated-stack/errors-are-schema.md)

**Types & Schemas**
- [JSDoc with First-Party Sources](opinions/opinionated-stack/jsdoc-with-first-party-sources.md)
- [No Magic Values](opinions/opinionated-stack/no-magic-values.md)
- [Use Branded Scalar Types](opinions/opinionated-stack/use-branded-scalar-types.md)
- [Use Canonical Named Types, Not Inline Object Shapes](opinions/opinionated-stack/use-canonical-named-types.md)

**Observability**
- [OTEL Conventions from Day One](opinions/opinionated-stack/otel-conventions-from-day-one.md)

**Dependencies & Toolchain**
- [Catalog Dependencies](opinions/opinionated-stack/catalog-dependencies.md)

**Monorepo & Database**
- [Schema Migrations Are Generated](opinions/opinionated-stack/schema-migrations-are-generated.md)

**Testing**
- [Test React Apps in Real Browsers](opinions/opinionated-stack/test-react-apps-in-real-browsers.md)

**Frontend & Design System**
- [Do Not Use Next.js](opinions/opinionated-stack/do-not-use-nextjs.md)
- [Do Not Synchronize State with useEffect](opinions/opinionated-stack/do-not-synchronize-state-with-useeffect.md)
- [Use the Design System, Not Ad Hoc Tailwind](opinions/opinionated-stack/use-the-design-system-not-ad-hoc-tailwind.md)

## Repo maintenance

Before editing or adding opinions, run the audits:

```bash
node scripts/audit-opinions.mjs
node scripts/verify-opinion-example-metadata.mjs
node scripts/find-duplicate-opinion-text.mjs
node scripts/check-markdown-links.mjs
```

These catch structural drift, metadata inconsistencies, repeated prose, and broken links.

## Contributing

Open an issue or PR. Each opinion should be a single markdown file with:
- A clear one-line rule
- Why agents get this wrong by default
- What to do instead
- An example if it helps

Place portable rules in `opinions/references/`. Place stack-specific rules in `opinions/opinionated-stack/`. See [AGENTS.md](AGENTS.md) for the full contributor guide.

## License

MIT
