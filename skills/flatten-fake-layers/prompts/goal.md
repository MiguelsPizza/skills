# Goal: flatten fake layers until the detector list is clean

You are flattening hand-rolled indirection out of a working TypeScript codebase, driven by the
`find-fake-layers` detector as your ground-truth signal. Read `../SKILL.md` first. Do not change
behavior — only remove indirection. Work iteratively until the detector's flagged list contains
nothing but items you have explicitly judged "keep".

## Setup (once)

```bash
cd scripts && npm install
```

Identify the project's type-check and lint commands (e.g. `tsc --noEmit -p <tsconfig>`, the repo
linter). You will run them after every change.

## The loop

1. **Detect.** Run:
   `scripts/node_modules/.bin/tsx scripts/find-fake-layers.mts <tsconfig> [pathFilter] --json`
   Parse the JSON candidate list. If empty, you are done.

2. **Pick the top candidate** (the list is ranked: `di-factory` and `alias` first, then `reshape`
   by fewest injected const fields).

3. **Judge it** with the one question that the tool cannot answer:
   **does the name add information the call site would lose?**
   - YES (a meaningful predicate, named computation, or domain concept) → it is a false positive.
     Leave it. Record it so you do not re-evaluate it next iteration.
   - NO (it only forwards, reshapes, or injects a dependency) → it is slop. Flatten it.

4. **Flatten** using ONLY delete + inline. Never add a function, type, factory, or file. The
   touched file's line count must not increase.
   - `di-factory`: import the injected dependency directly, drop the parameter, make the returned
     product a module-level `const`/`export`.
   - `alias`: delete it; point its one caller at the real function.
   - `reshape`: move the injected constant fields to the caller (or default them upstream); delete
     the wrapper.

5. **Verify.** Run type-check and lint. Both must pass. If either fails, fix or revert this one
   change before continuing — never leave the tree broken between iterations.

6. **Re-run the detector.** The flattened candidate must be gone. Go to step 1.

## Stopping condition

Stop when the flagged list contains only items you judged "keep". Report: how many you flattened,
how many you kept (and why), and the net line-count change.

## Guardrails

- If unsure whether a layer is real, KEEP it and flag it for human review. The cost of leaving one
  fake layer is small; the cost of deleting a real boundary is a bug.
- Do exactly one candidate per iteration so each change is independently verified and reviewable.
- Never edit the detector's `TUNING` block to make a candidate disappear — that is gaming the
  signal. Tune it only to fix a genuine misclassification for the whole repo, and say so.
- Commit (or stage) after each verified flatten so the history reads as one fake layer removed per
  step.
