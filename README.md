# Agent Opinions

Opinionated rules for AI coding agents. Copy what you agree with into your `AGENTS.md` / `CLAUDE.md`.

These exist because coding agents have default behaviors that optimize for "don't break anything right now" at the cost of long-term maintainability. Left unchecked, they produce codebases that work but are increasingly painful to maintain — dead code, compatibility shims, defensive checks for impossible states, and premature abstractions everywhere.

These opinions push back on that. They treat maintainability as equal priority to working code.

This repo is meant to stay maintainable too. Opinions should cross-reference instead of restating shared doctrine, and examples should stay aligned with real code patterns from the reference repos in [AGENTS.md](AGENTS.md).

## Usage

This repo now has three layers:

- `opinions/` — the uploadable skill package
- `opinions/references/` — portable rules for strict TypeScript repos
- `opinions/opinionated-stack/` — house doctrine for the full opinionated stack

Adoption modes:

- Use `references` when you want broadly reusable agent rules
- Use `references` + `opinionated-stack` when your repo follows the same architecture, docs policy, toolchain, and design-system conventions

Reference individual opinions in your project's agent instructions:

```md
# AGENTS.md
Follow the opinions in https://github.com/miguelspizza/agent-opinions
```

Or copy specific files into your repo and adapt them.

The standalone uploadable skill folder is [`opinions/`](opinions/). Its entry point is [opinions/SKILL.md](opinions/SKILL.md). Everything outside `opinions/` exists to maintain or author that skill package.

## Repo Maintenance

Before editing or adding opinions, run the local audits:

```bash
node scripts/audit-opinions.mjs
node scripts/verify-opinion-example-metadata.mjs
node scripts/find-duplicate-opinion-text.mjs
node scripts/check-markdown-links.mjs
```

What these catch:

- structural drift from the required opinion template
- missing or inconsistent example metadata and cross-doctrine references
- repeated prose that should become a cross-reference
- broken local Markdown links

Opinion files with an `## Example` section now also carry front matter metadata:

```yaml
---
example:
  primary: no-type-casts
  format: code
  implements:
    - no-type-casts
    - boundaries-validate-internals-trust
    - ssot-or-die
references:
  authority:
    - title: TypeScript Handbook
      url: https://www.typescriptlang.org/docs/
  local:
    - title: Local derivation note
      path: ./.sources/type-boundary-notes.md
  supporting: []
---
```

The `Example implements:` footer in the body must match this metadata exactly.

`references:` is optional for existing files and expected for new ones.

Use this source split:

- `authority` for official framework or vendor docs and other primary sources
- `local` for checked-in repo material only, using repo-relative paths
- `supporting` for secondary essays, talks, or social posts that reinforce but do not replace primary sources

Absolute filesystem paths and sibling-repo paths are invalid in committed `references:` metadata. The reference repos listed in [AGENTS.md](AGENTS.md) are authoring context, not portable checked-in metadata.

Keep references in front matter only by default. Do not add a `## References` section unless the opinion specifically needs visible prose about sources.

Tooling notes for broader TypeScript repo cleanup live in [docs/maintainability-tooling.md](docs/maintainability-tooling.md).

## TypeScript Repo Tooling

This repo also includes portable tooling templates for maintainable TypeScript repos and monorepos. Start with [tooling/README.md](tooling/README.md).

Use these when you want generic codebase checks for:

- dead exports, dead files, and dead dependencies
- circular imports and package-boundary violations
- duplicate code
- repo-specific AST rules like banning `as any` or `@ts-ignore`

The uploadable skill bundles its own copies of the downstream audit helpers and templates under [opinions/scripts](opinions/scripts/) and [opinions/assets/tooling-templates](opinions/assets/tooling-templates/).

## Opinions

### Portable Rules

#### Cleanup & Deletion
- [Delete Obsolete Code](opinions/references/delete-obsolete-code.md)
- [No Backwards Compatibility Shims](opinions/references/no-backwards-compat-shims.md)
- [No Unused Exports](opinions/references/no-unused-exports.md)
- [Clean Up What You Touch](opinions/references/clean-up-what-you-touch.md)

#### Error Handling
- [Error Messages Are UX](opinions/references/error-messages-are-ux.md)
- [Log at Boundaries, Not Everywhere](opinions/references/log-at-boundaries-not-everywhere.md)
- [No Defensive Catches](opinions/references/no-defensive-catches.md)
- [No Defensive Null Checks](opinions/references/no-defensive-null-checks.md)
- [Boundaries Validate, Internals Trust](opinions/references/boundaries-validate-internals-trust.md)

#### Abstractions & Architecture
- [No Premature Abstractions](opinions/references/no-premature-abstractions.md)
- [No Speculative Configuration](opinions/references/no-speculative-configuration.md)
- [Keep Schemas Minimal](opinions/references/keep-schemas-minimal.md)
- [Assign Cache Invalidation Owners](opinions/references/assign-cache-invalidation-owners.md)
- [SSOT or Die](opinions/references/ssot-or-die.md)

#### Dependencies & Libraries
- [Use Mature Dependencies, Don't Roll Your Own](opinions/references/use-mature-dependencies-dont-roll-your-own.md)

#### Code Quality
- [Naming Is Navigation](opinions/references/naming-is-navigation.md)
- [One Concept Per File](opinions/references/one-concept-per-file.md)
- [Comments Say Why Not What](opinions/references/comments-say-why-not-what.md)
- [Commit Messages Describe Why](opinions/references/commit-messages-describe-why.md)
- [Atomic Changes](opinions/references/atomic-changes.md)
- [Maintainability Equals Correctness](opinions/references/maintainability-equals-correctness.md)

#### Agent-Specific
- [Your Pattern Will Be Copied](opinions/references/your-pattern-will-be-copied.md)
- [Bounded Behavior](opinions/references/bounded-behavior.md)

#### Testing
- [Integration-First Testing](opinions/references/integration-first-testing.md)
- [No Type Casts](opinions/references/no-type-casts.md)

#### Monorepo & Package Structure
- [No Re-exports](opinions/references/no-re-exports.md)
- [No Barrel Exports](opinions/references/no-barrel-exports.md)
- [Monorepo Package Boundaries](opinions/references/monorepo-package-boundaries.md)

### Opinionated Stack

#### Start Here
- [Start Here](opinions/opinionated-stack/start-here.md)
- [Opinionated Stack Overview](opinions/opinionated-stack/stack-overview.md)

#### Error Handling & API Design
- [Errors Are Schema, Not Strings](opinions/opinionated-stack/errors-are-schema.md)

#### Types & Schemas
- [JSDoc with First-Party Sources](opinions/opinionated-stack/jsdoc-with-first-party-sources.md)
- [No Magic Values](opinions/opinionated-stack/no-magic-values.md)
- [Use Branded Scalar Types](opinions/opinionated-stack/use-branded-scalar-types.md)
- [Use Canonical Named Types, Not Inline Object Shapes](opinions/opinionated-stack/use-canonical-named-types.md)

#### Observability
- [OTEL Conventions from Day One](opinions/opinionated-stack/otel-conventions-from-day-one.md)

#### Dependencies & Toolchain
- [Catalog Dependencies](opinions/opinionated-stack/catalog-dependencies.md)

#### Monorepo & Database
- [Schema Migrations Are Generated](opinions/opinionated-stack/schema-migrations-are-generated.md)

#### Testing
- [Test React Apps in Real Browsers](opinions/opinionated-stack/test-react-apps-in-real-browsers.md)

#### Frontend & Design System
- [Do Not Use Next.js](opinions/opinionated-stack/do-not-use-nextjs.md)
- [Do Not Synchronize State with useEffect](opinions/opinionated-stack/do-not-synchronize-state-with-useeffect.md)
- [Use the Design System, Not Ad Hoc Tailwind](opinions/opinionated-stack/use-the-design-system-not-ad-hoc-tailwind.md)

## Resources

- [The Complete Guide to Building Skills for Claude](how-to-write-skill-guide/) — Anthropic's official skills guide, converted to Markdown

## Contributing

Open an issue or PR. Each opinion should be a single markdown file in `opinions/references/` or `opinions/opinionated-stack/` with:
- A clear one-line rule
- Why agents get this wrong by default
- What to do instead
- An example if it helps

Example doctrine for model-facing code:
- optimize examples for model copy behavior first, not hidden framework cleverness
- show the local pattern a model should write most often
- most examples may assume the house `publicProcedure` already provides typed `errors` helpers
- show explicit local `.errors(...)` only when the opinion is specifically teaching error contracts
- prefer one owner file per domain aggregate or feature boundary, not one file per exported symbol
- keep ownership visible through imports from canonical package-owned modules, not app-owned modules or fake all-in-one example files
- database ownership belongs in `packages/db`; shared-types must not depend on `apps/`
- add JSDoc to owner exports such as shared schemas, error sets, branded scalars, and constants; keep usage snippets lean

If the file includes `## Example`, also add the `example:` front matter block and an `Example implements:` footer that cites the same doctrines.

## License

MIT
