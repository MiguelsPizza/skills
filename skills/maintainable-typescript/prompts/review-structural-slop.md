# Review Structural Slop

Use this when you want a model to review a diff or file for agent-style cleanup failures rather than correctness-only review.

```text
Review this code for structural slop introduced by cleanup or refactor work.

Focus on findings, not praise.

Look specifically for:
- pass-through wrappers
- fake owners that should have been edits to an existing function
- shape churn (`Input`, `Context`, `Params`, `State`, `Result`)
- preserved migration layers or compatibility paths
- helper pyramids that hide a simple linear flow
- defensive catches, duplicate logging, or ad hoc error states
- weird local union types that only exist because the refactor added branches
- places where the return type became less obvious after the cleanup

For each finding:
1. Point to the file and line.
2. Say what the real owner should be.
3. Say what should be deleted or inlined.
4. Say whether the fix is "edit the owner", "delete the wrapper", or "rewrite the module".
```
