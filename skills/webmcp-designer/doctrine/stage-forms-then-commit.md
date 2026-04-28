---
example:
  primary: stage-forms-then-commit
  format: workflow
  implements:
    - stage-forms-then-commit
    - tool-types-have-clear-boundaries
    - design-for-agent-accessibility
---
# Stage Forms, Then Commit

**Rule:** Stage form state in a visible, reviewable step before you execute the irreversible action.

See also: [Tool Types Have Clear Boundaries](./tool-types-have-clear-boundaries.md) and [Design for Agent Accessibility](./design-for-agent-accessibility.md).

## Why agents get this wrong

Mutation flows should have a preparation step and a commit step. The agent should be able to stage visible state, inspect that state, and only then take the irreversible action.

This matters most for money movement, deletion, policy impact, or any action likely to surprise the user.

## What to do instead

Split the workflow into preparation and commit.

The preparation step should:
- fill or stage the form
- surface validation errors
- make the pending state readable

The commit step should:
- require the prepared state to exist
- use destructive annotations honestly
- fail loudly if the agent skipped review

## Example

Good flow:
1. Read current form state.
2. Stage passenger details.
3. Re-read the prepared state and validation results.
4. Ask for approval if the action is high impact.
5. Commit the booking.

Example implements: [Stage Forms, Then Commit](./stage-forms-then-commit.md), [Tool Types Have Clear Boundaries](./tool-types-have-clear-boundaries.md), [Design for Agent Accessibility](./design-for-agent-accessibility.md).
