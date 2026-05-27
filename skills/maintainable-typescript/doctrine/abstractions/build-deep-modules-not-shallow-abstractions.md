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

**Rule:** Hide meaningful complexity behind a small interface. Prefer one cohesive file over a forest of tiny helpers.

See also: [Resolve Uncertainty Into Contracts](../foundations/resolve-uncertainty-into-contracts.md), [Delete Fake Layers](../deletion/delete-fake-layers.md), and [Naming Is Navigation](../foundations/naming-is-navigation.md).

## Why agents get this wrong

Agents hear "small functions" and take it literally. They split one subsystem into `parse-foo.ts`, `validate-foo.ts`, `normalize-foo.ts`, and `execute-foo.ts` even when those pieces have no life outside one feature. The call graph gets longer while the interface gets no deeper.

AI agents can read a large file quickly once they find it. They are worse at discovering scattered context across a novel filesystem. Over-splitting turns comprehension into search.

## What to do instead

Make the interface small and the ownership obvious. Let the module absorb internal steps when they are only meaningful together. A module is deep when callers can use a simple contract without hunting through its internal choreography.

Split only when the split lowers total complexity: better information hiding, fewer dependencies, a deeper interface, or a repo convention that makes the file obvious. Do not split because a helper can be named or because a line count feels high.

Prefer somewhat general-purpose interfaces. The implementation should satisfy today's need, but the public shape should not be tied to one caller, button, route, or workflow.

If two extracted helpers must be read together to understand either one, inline them or move them behind one owning module.

MVC, Rails-style resources, and other strong conventions can support smaller files because the next file is predictable. In non-standard apps, colocate more until the repo has a real navigation system.

## The smell

If understanding one action requires opening five sibling files with nearly identical names, the abstraction is shallow. If a method exists for exactly one UI action or caller, check whether the caller's special case leaked into the lower-level interface.

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
