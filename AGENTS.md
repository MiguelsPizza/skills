# Agent Opinions — Contributor Guide

This repo publishes opinionated skills under `skills/`. Each opinion is a standalone markdown file in a skill's `doctrine/` or `stack/` directory.

## Goal

Keep agent changes maintainable and correct. Both are required.

## Scope

- Apply each skill within its domain. `Maintainable TypeScript` covers strict TypeScript, workspace packages, and modern tooling. `WebMCP Designer` covers agent interfaces for existing web apps.
- Treat the opinions as rules.
- Keep each opinion focused on one behavior.

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

Exception: `stack/` files may exceed 100 lines when the doctrine is intentionally stack-specific and decision-complete. Do not use that exception for `doctrine/`.

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
- `implements` must include the file slug itself plus at least two other opinion files
- The `Example implements:` footer in the body must link to the exact same doctrine list

## Prose

State the current rule and the concrete problem it solves. Use common words, active verbs, and short paragraphs. Cut repeated explanations, rhetorical questions, and rebuttals of old decisions. Keep exceptions and technical details that change what the reader should do.

Use [Write Good Docs](skills/write-good-docs/SKILL.md) for prose edits. Preserve commands, identifiers, examples, and source links unless the task changes their meaning.

## Placement rules

- Put a file in a skill's `doctrine/` directory if the rule survives a stack change
- Put a file in a skill's `stack/` directory if the rule depends on the chosen architecture, docs policy, toolchain, or design system
- Keep titles and filenames imperative
- Avoid soft verbs like `prefer`

## Reference Repos

Local reference repos with real-world examples live in `AGENTS.local.md` (gitignored). If you're the repo owner, create that file with paths to your local repos that demonstrate these patterns in practice.

## Opinion Categories

When creating new opinions, place them in the appropriate category in that skill's README. `Maintainable TypeScript` uses these categories; other skills may define their own focused index:

### Core categories

- **Cleanup & Deletion** — removing dead code, obsolete exports, commented-out blocks
- **Error Handling** — try/catch policy, null checks, validation boundaries
- **Abstractions & Architecture** — when to abstract, SSOT, configuration
- **Dependencies & Libraries** — dependency selection, avoiding homegrown commodity infrastructure
- **Tooling** — audit helpers, repo checks, and maintainability-focused tool usage
- **Code Quality** — naming, file ownership, comments, commits, maintainability standards
- **Agent-Specific** — behaviors unique to AI coding agents (pattern copying, bounded behavior)
- **Testing** — test structure, mocking policy, type-test discipline
- **Monorepo & Package Structure** — package boundaries, imports, exports

### Stack categories

- **Start Here** — overview files and stack reading order
- **Error Handling & API Design** — typed error contracts and API error doctrine
- **Types & Schemas** — documentation policy, canonical type ownership, constant/source doctrine
- **Observability** — telemetry naming and operational signal conventions
- **Dependencies & Toolchain** — workspace catalogs, toolchain-provided dependencies, package-manager conventions
- **Monorepo & Database** — generated migration workflow and schema change guardrails
- **Testing** — browser and stack-specific validation policy
- **Frontend & Design System** — component reuse, semantic tokens, approval gates for new primitives
