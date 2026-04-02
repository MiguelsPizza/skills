# Agent Opinions — Contributor Guide

This repo is a collection of opinionated, narrow, focused rules for AI coding agents working in TypeScript monorepos. Each opinion is a standalone markdown file in `opinions/references/` or `opinions/opinionated-stack/`.

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

Exception: `opinions/opinionated-stack/` files may exceed 100 lines when the doctrine is intentionally stack-specific and decision-complete. Do not use that exception for `opinions/references/`.

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

- Put a file in `opinions/references/` if the rule survives a stack change
- Put a file in `opinions/opinionated-stack/` if the rule depends on the chosen architecture, docs policy, toolchain, or design system
- Keep titles and filenames imperative
- Avoid soft verbs like `prefer`

## Reference Repos

These local repositories contain the patterns and docs that inform the opinions. Use them for examples, code samples, and to verify that opinions match real-world practice.

### optical-adjust — Types, Constants, and Documentation Patterns
**Path:** `/Users/alexmnahas/personalRepos/optical-adjust`

How this repo does things right:
- **JSDoc with first-party source links** — every type and constant links to authoritative references (NIST, university tutorials, local derivation docs)
- **No inline comments** — all documentation is JSDoc on exports, visible on hover
- **Constants as SSOT with derivation docs** — every constant has a `@see` link explaining where the value comes from
- **Semantic type aliases with source attribution** — `type Diopters = number` with a link to the optics textbook definition
- **Generic interfaces with readonly fields** — data containers are immutable by default
- **One domain concept per file** — grep-friendly, merge-conflict-resistant
- **Local source docs in `docs/`** — derivations, verification notes, and design docs checked into the repo (the pattern for `.sources/`)

Key files to reference:
| Pattern | File |
|---------|------|
| JSDoc with web source links | `/Users/alexmnahas/personalRepos/optical-adjust/packages/optics-types/src/units.ts` |
| JSDoc with local source refs | `/Users/alexmnahas/personalRepos/optical-adjust/packages/optics-constants/src/optics.ts` |
| Local derivation docs (source material) | `/Users/alexmnahas/personalRepos/optical-adjust/docs/equation_source_verification_notes.md` |
| Generic readonly interfaces | `/Users/alexmnahas/personalRepos/optical-adjust/packages/optics-types/src/psf.ts` |
| Prescription generics | `/Users/alexmnahas/personalRepos/optical-adjust/packages/optics-types/src/prescription.ts` |
| Package-level tsconfig (strict) | `/Users/alexmnahas/personalRepos/optical-adjust/packages/optics-types/tsconfig.json` |
| Vite+ workspace config | `/Users/alexmnahas/personalRepos/optical-adjust/vite.config.ts` |
| Vite+ toolchain docs | `/Users/alexmnahas/personalRepos/optical-adjust/AGENTS.md` |

### char-ai-saas — SSOT, Data-Layer-First, and oRPC Contracts
**Path:** `/Users/alexmnahas/personalRepos/WebMCP-org/char-ai-saas`

How this repo does things right:
- **Drizzle schema is the single source of truth** — Drizzle → drizzle-zod → Zod → oRPC → UI
- **Never hand-write a type that can be inferred** — everything traces back to the schema
- **`as const satisfies`** for exhaustive constant objects
- **Typed oRPC error contracts** — error schemas stay explicit and flow through the API surface
- **Boundaries validate, internals trust** — Zod at the edge, plain types inside
- **AI contribution manifesto** — codified rules for agent behavior in production codebases

Key files to reference:
| Pattern | File |
|---------|------|
| AI contribution manifesto | `/Users/alexmnahas/personalRepos/WebMCP-org/char-ai-saas/docs/codebase/ai-contribution-manifesto.md` |
| Data-layer-first best practices | `/Users/alexmnahas/personalRepos/WebMCP-org/char-ai-saas/docs/codebase/best-practices.md` |
| Drizzle schema derivation docs (SSOT) | `/Users/alexmnahas/personalRepos/WebMCP-org/char-ai-saas/docs/codebase/data-model.md` |
| oRPC router contracts | `/Users/alexmnahas/personalRepos/WebMCP-org/char-ai-saas/apps/char-ai-saas/worker/orpc/` |
| Error schemas (Zod + composable sets) | `/Users/alexmnahas/personalRepos/WebMCP-org/char-ai-saas/apps/char-ai-saas/worker/orpc/error-schemas.ts` |
| Error conversion (Effect → oRPC) | `/Users/alexmnahas/personalRepos/WebMCP-org/char-ai-saas/apps/char-ai-saas/worker/orpc/errors.ts` |
| OpenAPI config + spec generation | `/Users/alexmnahas/personalRepos/WebMCP-org/char-ai-saas/apps/char-ai-saas/worker/orpc/openapi-config.ts` |
| Zod shared-types package | `/Users/alexmnahas/personalRepos/WebMCP-org/char-ai-saas/packages/shared-types/src/` |
| Type source management | `/Users/alexmnahas/personalRepos/WebMCP-org/char-ai-saas/docs/codebase/type-sources.md` |
| WebMCP tool best practices | `/Users/alexmnahas/personalRepos/WebMCP-org/char-ai-saas/docs/codebase/webmcp-tool-best-practices.md` |
| Data model docs | `/Users/alexmnahas/personalRepos/WebMCP-org/char-ai-saas/docs/codebase/data-model.md` |
| System overview | `/Users/alexmnahas/personalRepos/WebMCP-org/char-ai-saas/docs/codebase/system-overview.md` |

**Note on char's error pattern:** Char uses a three-layer error system (Effect classes → Zod schemas → ORPCError) with a conversion mapping. This works but has unnecessary ceremony. The opinion in `opinions/opinionated-stack/errors-are-schema.md` recommends a simpler approach: define Zod error schemas once, use them directly in procedure error contracts, and skip the domain error classes and conversion layer. Reference char's `error-schemas.ts` for the Zod schema + composable error set pattern (that part is good), but don't copy the Effect error classes or the `toORPCError` mapping.

### npm-packages — Testing Patterns
**Path:** `/Users/alexmnahas/personalRepos/WebMCP-org/npm-packages`

How this repo does things right:
- **3-layer test pyramid** — contract tests → slice integration → browser integration
- **Mocking policy** — mock external boundaries only, never internal modules. If 2+ internal mocks needed → rewrite as slice integration test
- **Deterministic waits** — `vi.waitFor()` not arbitrary timeouts
- **Test isolation** — `beforeEach` clears state, `afterEach` cleans up resources
- **Separate E2E config** — dedicated `vitest.e2e.config.ts` with longer timeouts for slow tests
- **Browser tests run in real browsers** — Vitest Browser Mode + Playwright, not jsdom

Key files to reference:
| Pattern | File |
|---------|------|
| Testing philosophy | `/Users/alexmnahas/personalRepos/WebMCP-org/npm-packages/docs/TESTING_PHILOSOPHY.md` |
| Testing guide | `/Users/alexmnahas/personalRepos/WebMCP-org/npm-packages/docs/TESTING_GUIDE.md` |
| Testing runbook | `/Users/alexmnahas/personalRepos/WebMCP-org/npm-packages/docs/TESTING.md` |
| React hook tests (browser) | `/Users/alexmnahas/personalRepos/WebMCP-org/npm-packages/packages/react-webmcp/src/useWebMCP.test.ts` |
| Schema contract tests | `/Users/alexmnahas/personalRepos/WebMCP-org/npm-packages/packages/webmcp-local-relay/src/schemas.test.ts` |
| CLI unit tests (mocking) | `/Users/alexmnahas/personalRepos/WebMCP-org/npm-packages/packages/webmcp-local-relay/src/cli-utils.test.ts` |
| Component tests (provider) | `/Users/alexmnahas/personalRepos/WebMCP-org/npm-packages/packages/react-webmcp/src/client/McpClientProvider.test.tsx` |
| Full E2E (real runtime) | `/Users/alexmnahas/personalRepos/WebMCP-org/npm-packages/packages/webmcp-local-relay/src/relay.e2e.test.ts` |
| Test setup pattern | `/Users/alexmnahas/personalRepos/WebMCP-org/npm-packages/packages/react-webmcp/src/test-setup.ts` |
| E2E-specific vitest config | `/Users/alexmnahas/personalRepos/WebMCP-org/npm-packages/packages/webmcp-local-relay/vitest.e2e.config.ts` |
| Browser test vitest config | `/Users/alexmnahas/personalRepos/WebMCP-org/npm-packages/packages/react-webmcp/vite.config.ts` |
| Contributing (test reqs) | `/Users/alexmnahas/personalRepos/WebMCP-org/npm-packages/CONTRIBUTING.md` |

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
