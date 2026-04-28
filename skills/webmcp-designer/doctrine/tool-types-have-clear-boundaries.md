---
example:
  primary: tool-types-have-clear-boundaries
  format: text
  implements:
    - tool-types-have-clear-boundaries
    - stage-forms-then-commit
    - route-maps-drive-discovery
---
# Tool Types Have Clear Boundaries

**Rule:** Do not collapse inspection, context switching, and mutation into one ambiguous tool unless they truly share one risk profile.

See also: [Stage Forms, Then Commit](./stage-forms-then-commit.md) and [Route Maps Drive Discovery](./route-maps-drive-discovery.md).

## Why agents get this wrong

Read, navigation, and write tools create different kinds of change. If you collapse them together, the schema, annotations, and safety story become muddy.

## What to do instead

Split the surface by behavior:
- read tools inspect data and should be safe to serialize
- navigation tools change context and reveal more tools
- write tools change application state and need honest annotations

If a SPA needs tab changes or sub-routes before more data can appear, model that as navigation, not as a side effect buried inside a read or write tool.

## Example

Bad:
- `manage_checkout` changes tabs, fetches totals, fills payment data, and submits the order

Good:
- one tool moves to checkout
- one or more tools read totals and validation state
- one tool stages form values
- one tool commits the purchase

Example implements: [Tool Types Have Clear Boundaries](./tool-types-have-clear-boundaries.md), [Stage Forms, Then Commit](./stage-forms-then-commit.md), [Route Maps Drive Discovery](./route-maps-drive-discovery.md).
