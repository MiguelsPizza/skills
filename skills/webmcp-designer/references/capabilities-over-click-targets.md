---
example:
  primary: capabilities-over-click-targets
  format: code
  implements:
    - capabilities-over-click-targets
    - read-tools-live-at-data-boundaries
    - tool-descriptions-are-local-contracts
---
# Capabilities Over Click Targets

**Rule:** Prefer a small set of parameterized tools over one tool per widget, row, or button.

See also: [Read Tools Live at Data Boundaries](read-tools-live-at-data-boundaries.md) and [Tool Descriptions Are Local Contracts](tool-descriptions-are-local-contracts.md).

## Why agents get this wrong

Model the capability, not the click target. The app may render thirty buttons, but the agent usually needs one parameterized operation.

## What to do instead

Use parameters to select the record, action, filter, or variant.

Do not make tools so broad that one description must lie about half the cases. Split only when the safety profile, semantics, or output shape diverge enough that one schema becomes dishonest.

## Example

```typescript
// Bad: UI-shaped tool explosion
deleteTodo1()
deleteTodo2()
deleteTodo3()

// Better: one domain operation
manageTodos({
  action: 'delete',
  todoId: 'todo_123',
})
```

Example implements: [Capabilities Over Click Targets](capabilities-over-click-targets.md), [Read Tools Live at Data Boundaries](read-tools-live-at-data-boundaries.md), [Tool Descriptions Are Local Contracts](tool-descriptions-are-local-contracts.md).
