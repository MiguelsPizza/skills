# Agent Opinions — Contributor Guide

This repo currently centers on one published skill: `Maintainable TypeScript`. Each opinion is a standalone markdown file in `skills/maintainable-typescript/references/` or `skills/maintainable-typescript/opinionated-stack/`.

## Goal

Push back on default agent behaviors that degrade codebases over time. Agents optimize for "don't break anything right now" — these opinions optimize for "leave the codebase better than you found it." Maintainability is treated as equal priority to working code.

## Scope

- **TypeScript monorepos only.** These opinions assume strict TypeScript, workspace packages, and modern tooling.
- **Extremely opinionated.** These are not guidelines — they're rules. If you disagree, fork.
- **Narrow and focused.** Each opinion covers exactly one behavior. No sprawling style guides.

## How to write/edit opinions

Each opinion file follows this structure:

```md
# Title (imperative mood)

**Rule:** One-sentence summary of the rule.

## Why agents get this wrong
What default agent behavior causes this problem.

## What to do instead
The correct approach, with rationale.

## Example
Code showing the bad pattern and the good pattern.
```

Keep portable opinions under 100 lines. If it needs more, it's two opinions.

Exception: `skills/maintainable-typescript/opinionated-stack/` files may exceed 100 lines when the doctrine is intentionally stack-specific and decision-complete. Do not use that exception for `skills/maintainable-typescript/references/`.

## Example metadata

If an opinion file contains `## Example`, it must also include front matter that declares the example contract:

```yaml
---
example:
  primary: no-type-casts
  format: code
  implements:
    - no-type-casts
    - boundaries-validate-internals-trust
    - ssot-or-die
---
```

Rules:
- `primary` must match the file slug
- `format` must be one of `code`, `text`, or `workflow`
- `implements` must include the file slug itself plus at least two other doctrine files
- The `Example implements:` footer in the body must link to the exact same doctrine list

## Placement rules

- Put a file in `skills/maintainable-typescript/references/` if the rule survives a stack change
- Put a file in `skills/maintainable-typescript/opinionated-stack/` if the rule depends on the chosen architecture, docs policy, toolchain, or design system
- Keep titles and filenames imperative
- Avoid soft verbs like `prefer`

## Reference Repos

Local reference repos with real-world examples live in `AGENTS.local.md` (gitignored). If you're the repo owner, create that file with paths to your local repos that demonstrate these patterns in practice.

## Opinion Categories

When creating new opinions, place them in the appropriate category in the README:

### Core categories

- **Cleanup & Deletion** — removing dead code, obsolete exports, commented-out blocks
- **Error Handling** — try/catch policy, null checks, validation boundaries
- **Abstractions & Architecture** — when to abstract, SSOT, configuration
- **Dependencies & Libraries** — dependency selection, avoiding homegrown commodity infrastructure
- **Code Quality** — naming, file ownership, comments, commits, maintainability standards
- **Agent-Specific** — behaviors unique to AI coding agents (pattern copying, bounded behavior)
- **Testing** — test structure, mocking policy, type-test discipline
- **Monorepo & Package Structure** — package boundaries, imports, exports

### Stack categories

- **Error Handling & API Design** — typed error contracts and API error doctrine
- **Types & Schemas** — documentation policy, canonical type ownership, constant/source doctrine
- **Dependencies & Toolchain** — workspace catalogs, toolchain-provided dependencies, package-manager conventions
- **Monorepo & Database** — generated migration workflow and schema change guardrails
- **Frontend & Design System** — component reuse, semantic tokens, approval gates for new primitives
