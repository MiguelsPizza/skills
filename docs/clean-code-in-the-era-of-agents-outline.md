# Clean Code in the Era of Agents

Working outline and source map for a blog post / Hacker News post about how to write maintainable code when code generation is cheap and churn is extreme.

## One-sentence thesis

Old clean-code advice was written for a world where code was expensive to produce. In the era of coding agents, code is cheap, structure is expensive, and maintainability means optimizing for review, deletion, and safe replacement under high churn.

## Core post goals

1. Explain how maintainable code changes when code can be generated instantly.
2. Explain how to get agents to write good code instead of producing endless patchy local refactors.

## Reader promise

This post should help a technical reader:

- update their mental model of clean code for agent-heavy development
- understand the main ways agents degrade codebases
- adopt a few concrete rules that make agent output much better
- stop treating small diffs and local neatness as the same thing as good design

## Audience

- staff and senior engineers using AI coding tools daily
- startup founders and indie hackers shipping quickly with agents
- skeptical engineers who think agent-generated code is inherently sloppy
- people on Hacker News who already know classic clean-code / refactoring doctrine

## Good title options

- Clean Code in the Era of Agents
- Code Is Cheap, Structure Is Expensive
- How I Get Coding Agents to Write Maintainable Code
- Clean Code After AI
- Maintainable Code When Code Generation Is Free

## Best opening move

Lead with the cost-model change.

Possible opening:

> A lot of clean-code advice was written for a world where writing code was expensive. That world is gone. Today I can generate more code in an afternoon with an agent than a large team used to write in weeks. The bottleneck is no longer production. It is comprehension. The new problem is not “how do we write less code?” The new problem is “how do we stop agents from flooding the codebase with plausible garbage structure?”

## Main argument

### 1. The cost model changed

Old default:

- code was expensive to write
- duplication felt expensive
- preserving structure felt prudent
- big rewrites were unusually costly

Agent-era default:

- code is cheap to generate
- abstraction residue spreads quickly
- bad local patterns get copied everywhere
- preserving stale structure is often worse than rewriting a module

Key line:

> Code is cheap now. Structure is expensive.

### 2. The biggest failure mode is preserve-and-patch bias

Agents are strongly biased toward:

- minimum-diff patches
- preserving existing decomposition
- adding adapters instead of changing callers
- extracting helpers too early
- adding wrapper layers because they feel safer than rewriting

This creates:

- shape churn
- pass-through wrappers
- stale migration layers
- one-function-per-file call graphs
- files that no longer match the real job they do

Key line:

> Agents preserve obsolete structure because existing code feels authoritative, even when it is just historical residue.

### 3. Maintainability now means truthful structure

The right question is no longer:

- how do we keep the diff small?

It is:

- does the code still reflect the current reality of the system?

Maintainable code in the agent era should optimize for:

- scanability under heavy churn
- fewer concepts, not fewer lines
- stable contracts and boundaries
- easy deletion
- safe replacement of internals
- patterns worth copying

### 4. The new default should be preserve contracts, not decomposition

This is probably the central section of the post.

Core rule:

- preserve tests, contracts, and invariants
- do not preserve dead structure

When requirements change enough, rewrite the internals of a module in one pass instead of performing another round of “safe” local refactors around an obsolete shape.

Key line:

> Small diffs are not a design goal. Truthful code is.

### 5. This changes what “clean code” means in practice

New clean-code bias:

- prefer deletion over compatibility shims
- prefer one canonical shape inside a subsystem
- prefer direct calls over fake wrappers
- prefer stable subsystem files over tiny helper trees
- prefer rewriting churned modules over preserving yesterday’s decomposition
- prefer boundary tests over internal choreography tests

## Two-part structure

## Part I: How to write maintainable code when code can be generated instantly

This part is about the code itself.

### Section ideas

#### A. Code is cheap, structure is expensive

Main sources:

- `skills/maintainable-typescript/doctrine/foundations/write-for-the-agent-era.md`
- `skills/maintainable-typescript/doctrine/foundations/maintainability-equals-correctness.md`
- `skills/maintainable-typescript/doctrine/foundations/your-pattern-will-be-copied.md`

What to say:

- maintainability is no longer mainly about reducing keystrokes
- it is about reducing scan cost and conceptual drag
- generated code amplifies mediocre local patterns quickly

#### B. Stop preserving obsolete decomposition

Main sources:

- `skills/maintainable-typescript/doctrine/foundations/write-for-the-agent-era.md`
- `skills/maintainable-typescript/doctrine/deletion/delete-obsolete-code.md`
- `skills/maintainable-typescript/doctrine/deletion/no-backwards-compat-shims.md`
- `skills/maintainable-typescript/doctrine/deletion/no-backwards-compat-shims.md`
- `skills/maintainable-typescript/doctrine/foundations/atomic-changes.md`

What to say:

- update all callers in one change
- delete old paths immediately
- do not keep transitional layers after the transition
- internal codebases should not behave like published libraries

#### C. Every layer must earn its keep

Main sources:

- `skills/maintainable-typescript/doctrine/deletion/delete-fake-layers.md`
- `skills/maintainable-typescript/doctrine/deletion/delete-fake-layers.md`
- `skills/maintainable-typescript/doctrine/abstractions/no-premature-abstractions.md`
- `skills/maintainable-typescript/doctrine/abstractions/build-deep-modules-not-shallow-abstractions.md`
- `skills/maintainable-typescript/doctrine/abstractions/design-around-composable-primitives.md`

What to say:

- a layer is justified only if it owns a real boundary, invariant, lifecycle, policy, or irreversible transformation
- renaming and reshaping are not architecture
- deep modules beat shallow wrapper forests

#### D. Stable seams matter more than tiny files

Main sources:

- `skills/maintainable-typescript/doctrine/abstractions/split-by-stable-seam.md`
- `skills/maintainable-typescript/doctrine/foundations/naming-is-navigation.md`
- `skills/maintainable-typescript/doctrine/packages/monorepo-package-boundaries.md`
- `skills/maintainable-typescript/doctrine/packages/no-barrel-exports.md`
- `skills/maintainable-typescript/doctrine/packages/no-re-exports.md`

What to say:

- agents misread “single responsibility” as “one helper per file”
- navigation matters because agents learn by grepping
- names and paths are part of the architecture

#### E. One source of truth, one canonical shape

Main sources:

- `skills/maintainable-typescript/doctrine/abstractions/ssot-or-die.md`
- `skills/maintainable-typescript/doctrine/boundaries/pass-values-across-boundaries.md`
- `skills/maintainable-typescript/doctrine/boundaries/no-type-casts.md`
- `skills/maintainable-typescript/doctrine/boundaries/boundaries-validate-internals-trust.md`

What to say:

- agent-generated code drifts when concepts are duplicated locally
- keep one canonical internal shape
- derive types and contracts from authoritative sources
- do not use casts to paper over broken boundaries

#### F. Tests should stabilize behavior, not freeze bad structure

Main sources:

- `skills/maintainable-typescript/doctrine/testing/integration-first-testing.md`
- `skills/maintainable-typescript/doctrine/testing/external-boundary-mocks-only.md`
- `skills/maintainable-typescript/doctrine/testing/assert-observable-outcomes.md`
- `skills/maintainable-typescript/doctrine/testing/contract-gate-synthetic-fixtures.md`
- `skills/maintainable-typescript/doctrine/testing/test-ai-apps-by-artifacts-not-prose.md`

What to say:

- if tests lock in helper choreography, they make future rewrites harder
- agent-era tests should attach to product boundaries and observable outcomes

## Part II: How to get agents to write good code and refactor well

This part is about agent doctrine and promptable rules.

### Section ideas

#### A. What agents are trained to do wrong

Main sources:

- `skills/maintainable-typescript/doctrine/foundations/write-for-the-agent-era.md`
- `skills/maintainable-typescript/doctrine/foundations/your-pattern-will-be-copied.md`
- `skills/maintainable-typescript/doctrine/abstractions/no-premature-abstractions.md`
- `skills/maintainable-typescript/doctrine/deletion/clean-up-what-you-touch.md`

What to say:

- agents optimize for local success and low-risk patches
- they overvalue DRY
- they preserve stale examples
- they often leave the file worse while technically solving the task

#### B. The rules I give agents

This should probably be a clean bullet list in the post.

Good rules to include:

- Preserve contracts, tests, and invariants. Do not preserve obsolete decomposition.
- If a file has churned enough that it no longer matches the job, rewrite the internals in one pass.
- Do not add helpers that only rename or reshape data.
- Do not add compatibility shims in internal code. Update all callers.
- Delete obsolete code in the same change that replaces it.
- Prefer one canonical shape inside a subsystem.
- Prefer direct calls over pass-through wrappers.
- If a test needs internal mocks to work, the test boundary is wrong.
- Every pattern you ship will be copied.

Primary source files:

- `skills/maintainable-typescript/doctrine/foundations/write-for-the-agent-era.md`
- `skills/maintainable-typescript/doctrine/deletion/delete-fake-layers.md`
- `skills/maintainable-typescript/doctrine/deletion/delete-fake-layers.md`
- `skills/maintainable-typescript/doctrine/deletion/delete-obsolete-code.md`
- `skills/maintainable-typescript/doctrine/deletion/no-backwards-compat-shims.md`
- `skills/maintainable-typescript/doctrine/foundations/your-pattern-will-be-copied.md`

#### C. How I decide when to rewrite instead of patch

This section does not fully exist yet as one doctrine file, but it is implied across several files.

Suggested rewrite triggers:

- more than half the file is conceptually changing
- names no longer match current behavior
- the file preserves old phases or historical workflow steps
- new work requires more flags, adapters, and forwarding helpers
- explaining the clean design is easier than explaining the current one
- the exported contract can stay stable even if internals are replaced

Supporting sources:

- `skills/maintainable-typescript/doctrine/foundations/write-for-the-agent-era.md`
- `skills/maintainable-typescript/doctrine/deletion/delete-fake-layers.md`
- `skills/maintainable-typescript/doctrine/deletion/delete-fake-layers.md`
- `skills/maintainable-typescript/doctrine/deletion/no-backwards-compat-shims.md`
- `skills/maintainable-typescript/doctrine/abstractions/build-deep-modules-not-shallow-abstractions.md`

Potential line:

> If writing the module fresh to today’s requirements would produce a materially simpler design, stop preserving yesterday’s structure.

#### D. Tooling as doctrine, not just cleanup

Main sources:

- `skills/maintainable-typescript/doctrine/tooling/maintainability-tooling.md`
- `skills/maintainable-typescript/scripts/audit-typescript-repo.sh`
- `skills/maintainable-typescript/scripts/audit-typescript-dead-code.sh`
- `skills/maintainable-typescript/scripts/audit-typescript-duplicate-code.sh`
- `skills/maintainable-typescript/scripts/audit-typescript-architecture.sh`
- `skills/maintainable-typescript/assets/tooling-templates/.knip.json`
- `skills/maintainable-typescript/assets/tooling-templates/.dependency-cruiser.mjs`
- `skills/maintainable-typescript/assets/tooling-templates/.jscpd.json`
- `skills/maintainable-typescript/assets/tooling-templates/ast-grep/no-as-any.yml`
- `skills/maintainable-typescript/assets/tooling-templates/ast-grep/no-ts-ignore.yml`

What to say:

- agents will not remember repo rules reliably
- if the same failure mode keeps recurring, codify it in tooling
- static analysis is part of agent supervision

## Strong local source map

### Best files for the main thesis

- `skills/maintainable-typescript/doctrine/foundations/write-for-the-agent-era.md`
- `skills/maintainable-typescript/doctrine/foundations/maintainability-equals-correctness.md`
- `skills/maintainable-typescript/doctrine/foundations/your-pattern-will-be-copied.md`

### Best files for deletion / rewrite doctrine

- `skills/maintainable-typescript/doctrine/deletion/delete-obsolete-code.md`
- `skills/maintainable-typescript/doctrine/deletion/no-backwards-compat-shims.md`
- `skills/maintainable-typescript/doctrine/deletion/no-backwards-compat-shims.md`
- `skills/maintainable-typescript/doctrine/foundations/atomic-changes.md`

### Best files for anti-fake-abstraction doctrine

- `skills/maintainable-typescript/doctrine/deletion/delete-fake-layers.md`
- `skills/maintainable-typescript/doctrine/deletion/delete-fake-layers.md`
- `skills/maintainable-typescript/doctrine/abstractions/no-premature-abstractions.md`
- `skills/maintainable-typescript/doctrine/abstractions/build-deep-modules-not-shallow-abstractions.md`
- `skills/maintainable-typescript/doctrine/abstractions/design-around-composable-primitives.md`

### Best files for structure and ownership

- `skills/maintainable-typescript/doctrine/abstractions/split-by-stable-seam.md`
- `skills/maintainable-typescript/doctrine/foundations/naming-is-navigation.md`
- `skills/maintainable-typescript/doctrine/packages/monorepo-package-boundaries.md`
- `skills/maintainable-typescript/doctrine/packages/no-barrel-exports.md`
- `skills/maintainable-typescript/doctrine/packages/no-re-exports.md`

### Best files for tests and safety rails

- `skills/maintainable-typescript/doctrine/testing/integration-first-testing.md`
- `skills/maintainable-typescript/doctrine/testing/external-boundary-mocks-only.md`
- `skills/maintainable-typescript/doctrine/testing/assert-observable-outcomes.md`
- `skills/maintainable-typescript/doctrine/foundations/bounded-behavior.md`
- `skills/maintainable-typescript/doctrine/tooling/maintainability-tooling.md`

## What not to overload the post with

These are good doctrine files, but probably sidebars or separate follow-up posts rather than core material for this article:

- stack-specific frontend doctrine like Next.js, `useEffect`, design-system policy
- detailed OpenAPI / oRPC inference chain
- migration generation workflow
- OTEL naming specifics
- branded scalar type details

They support the broader worldview, but they are not the main argument.

## Good contrasts to make explicit

### Old clean-code bias vs agent-era clean-code bias

Old bias:

- minimize duplication
- keep diffs small
- preserve structure
- abstract early for reuse

New bias:

- minimize conceptual duplication
- keep structure truthful
- delete aggressively
- rewrite churned internals behind stable contracts

### Human-era failure mode vs agent-era failure mode

Old failure mode:

- under-refactoring
- too much copy-paste
- not enough abstraction

New failure mode:

- overproduction of weak abstractions
- preservation of dead structure
- mechanical local refactors that never re-center the design

## Possible section headers

- Code Is Cheap, Structure Is Expensive
- The Biggest Agent Failure Mode Is Preserve-and-Patch
- Small Diffs Are Not a Design Goal
- Preserve Contracts, Not Dead Structure
- Every Layer Must Earn Its Keep
- Your Codebase Is Training the Next Agent
- Tests Should Protect Behavior, Not Choreography
- Tooling Is Part of Agent Supervision

## Possible pull quotes

- Code is cheap now. Structure is expensive.
- Small diffs are not a design goal. Truthful code is.
- Preserve contracts, tests, and invariants. Do not preserve obsolete decomposition.
- Every layer must answer: what new fact becomes true after this runs?
- If a file has churned enough, rewrite the internals instead of preserving history.
- Whatever you write becomes training data for the next agent.

## Suggested ending

End with a concrete claim, not a soft summary.

Possible ending:

> Clean code in the era of agents is not about making code shorter, drier, or more abstract. It is about making code easier to replace without fear. Agents can generate code faster than teams can review it. That means the real job now is not producing code. It is defending the codebase from cheap structure. The best repos will be the ones that learn to delete more, name better, test at boundaries, and rewrite modules when the old shape stops telling the truth.

## Good next steps after this outline

1. Turn this into a real draft with a strong opening and two major sections.
2. Add one section with concrete agent instructions or prompt snippets.
3. Consider adding one explicit rewrite checklist as a sidebar.
4. Optionally create a new Cleanup & Deletion doctrine file on rewriting churned modules.
