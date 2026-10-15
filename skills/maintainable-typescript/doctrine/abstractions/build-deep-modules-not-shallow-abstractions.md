---
example:
  primary: build-deep-modules-not-shallow-abstractions
  format: code
  implements:
    - build-deep-modules-not-shallow-abstractions
    - resolve-uncertainty-into-contracts
    - naming-is-navigation
---
# Build Deep Modules, Not Shallow Abstractions

**Rule:** Hide meaningful complexity behind a small interface. Keep steps with one owner in one cohesive module.

See also: [Resolve Uncertainty Into Contracts](../foundations/resolve-uncertainty-into-contracts.md), [Delete Fake Layers](../deletion/delete-fake-layers.md), and [Naming Is Navigation](../foundations/naming-is-navigation.md).

## Why agents get this wrong

Agents split one workflow into parsing, validation, normalization, and execution files even when none has an independent caller. Readers must then search several files to understand one action.

## What to do instead

Give each module a small public contract and a clear owner. Keep internal steps together when callers only need the combined result.

Split when it hides more complexity, reduces dependencies, improves the public contract, or follows a predictable repository convention. A name or line count alone does not justify a new file.

Serve today's needs through operations that callers can compose. Keep UI actions and caller-specific decisions out of lower-level interfaces.

If two extracted helpers must be read together to understand either one, inline them or move them behind one owning module.

Framework conventions such as MVC can make smaller files easy to find. Without such a convention, keep more of the workflow together.

## Example

```typescript
// Text editor: bad. The lower-level text module mirrors UI actions.
export function backspace(cursor: Cursor): void;
export function deleteKey(cursor: Cursor): void;
export function deleteSelection(selection: Selection): void;

// Text editor: good. UI code decides what range to edit.
export function deleteText(range: TextRange): void;
export function insertText(position: TextPosition, text: string): void;
```

```text
Non-standard app workflow: colocate more.

Good:
features/review-runs/create-review-run.ts
  createReviewRun()
  parseCreateReviewRunInput()
  buildReviewRunDraft()
  persistReviewRun()
  publishReviewRunCreated()

Bad:
features/review-runs/parse-create-review-run-input.ts
features/review-runs/build-review-run-draft.ts
features/review-runs/persist-review-run.ts
features/review-runs/publish-review-run-created.ts

The bad split looks tidy, but every change requires opening every file.
Those helpers have one caller, one lifecycle, and one reason to change.
```

```text
Convention-heavy MVC app: smaller files can be fine.

Good:
app/controllers/review_runs_controller.rb
app/models/review_run.rb
app/views/review_runs/show.html.erb

The convention makes the next file obvious. The split is navigable.
Do not copy that split into a custom TypeScript app without an equally
predictable convention.
```

Example implements: [Build Deep Modules, Not Shallow Abstractions](./build-deep-modules-not-shallow-abstractions.md), [Resolve Uncertainty Into Contracts](../foundations/resolve-uncertainty-into-contracts.md), [Naming Is Navigation](../foundations/naming-is-navigation.md).
