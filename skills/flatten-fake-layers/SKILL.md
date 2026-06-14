---
name: flatten-fake-layers
description: >-
  Find and flatten "fake layer" indirection in a TypeScript codebase — functions with exactly
  one caller that only forward, reshape, or inject dependencies and add no fact. Runs a
  deterministic AST detector that flags candidates, then uses agent judgment to inline the
  real slop while keeping genuine named helpers. Use when asked to reduce over-abstraction,
  "un-slop" or simplify code, flatten dependency-injection ceremony, delete single-use
  wrappers, or clean up AI-generated indirection. Pairs with a goal/loop prompt to run
  iteratively across a codebase until clean.
license: MIT
metadata:
  author: Alex Nahas
  version: 1.0.0
  requires: node, ts-morph, tsx
---

# Flatten Fake Layers

Operationalizes the `delete-fake-layers` doctrine with a script instead of prose. The thesis:
**a model is bad at finding its own over-abstraction by reading code, but good at judging a
concrete candidate the moment a tool points at it.** So this skill does not ask you to scan for
slop — it runs a detector that flags exact violations, and you apply one judgment per item.

## What a "fake layer" is

A function/const that exists only to forward to another call, reshape arguments, or inject a
dependency — adding no invariant, validation, lifecycle guarantee, or real ownership. The test
(from `delete-fake-layers`): *what becomes true after this layer runs?* If the answer is "same
data, different name" or "same call, different function", it is a fake layer.

Whole-program tools (knip, fallow) find code with **zero** callers. They cannot find the layer
with **one** caller that should not exist. That is this script's gap to fill.

## When NOT to flatten

A one-caller function is fine — often good — when its **name carries information the call site
would lose**. `hasConfiguredCloudflareAccess(env)` reads better than its inlined boolean.
`toHex(bytes)` names a computation. These are not slop. The detector already suppresses
predicates, hooks, and lifecycle code; for everything it flags, you still apply the judgment:
**does the name add information the caller lacks?** If yes, keep. If no, inline.

## Step 1 — install and run the detector

```bash
cd scripts && npm install            # one-time: installs ts-morph + tsx
node_modules/.bin/tsx find-fake-layers.mts <path/to/tsconfig.json> [pathFilter] [--json]
```

`pathFilter` is an optional substring (e.g. `src/server`) to scope a large repo. `--json` emits
the candidate list as structured evidence for a loop/goal model to consume.

The flagged list is ranked. It reports three shapes:

- **`di-factory`** — a factory whose parameter is captured inside the closure it returns
  (hand-rolled dependency injection). Almost always real slop: import the dependency directly
  and make the product a module-level value.
- **`alias`** — forwards its arguments unchanged to one project function ("same call, different
  name"). Inline it; replace the reference with the target.
- **`reshape`** — builds an object literal and forwards it, annotated with `+N const fields`
  (how many constant values it injects). **Few const fields = clean inline-upstream target**
  (push the constant to the caller); many = it is assembling a real config block, judge with care.

Suppressed (never flagged): predicates (`is/has/should`), React hooks (`use*`), `try/finally`
and validation-boundary bodies, cross-package exports (public API), and framework-registered
route handlers. See the `TUNING` block at the top of the script to adjust these per stack
(router method names, monorepo layout, React/Zod signals).

## Step 2 — flatten, one candidate at a time

For each flagged item, apply the judgment, then if it is slop use only two operations: **delete
and inline**. Never introduce new indirection; the touched file's line count must not increase.

- `di-factory`: import the injected dependency directly (it is a static import everywhere else),
  drop the parameter, and turn the returned product into a module-level `const`/`export`.
- `alias`: delete it; point its single caller at the real function.
- `reshape`: move the injected constant fields to the call site (or let the upstream function
  default them) and delete the wrapper.

## Step 3 — verify, then re-run

After each change run the project's type-check and lint (e.g. `tsc --noEmit`, the repo linter).
Both must pass. Then re-run the detector — a flattened candidate disappears from the list. Repeat
until the flagged list contains only items you have judged "keep". A closed list means done.

## Running it as a goal loop

To run this autonomously across a whole codebase, feed `prompts/goal.md` to a goal/loop runner
(Codex `--goal`, Claude Code, etc.). It instructs the model to run the detector, triage each
candidate against the judgment, inline the real slop, verify, and re-run until the list is clean —
with the script as the ground-truth feedback signal on every iteration.
