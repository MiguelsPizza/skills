# Review Structural Slop

Use this when you want a model to review a diff or file for agent-style cleanup failures rather than correctness-only review.

```text
Review this code for structural slop introduced by cleanup, refactor, or agent-generated implementation work.

Focus on findings, not praise.

AI slop means code that looks locally defensive or flexible but weakens the system contract. Find places where the implementation preserves uncertainty instead of resolving it into a type, schema, owner, or real boundary.

Look specifically for:
- shape churn: `normalize*`, `to*`, `map*`, `adapt*`, `coerce*`, `Input`, `Context`, `Params`, `State`, or `Result` shapes between internal callers
- boundary theater: validation, fallback, or compatibility code inside already-typed internal code
- optionality creep: `input?.field`, optional callbacks, or no-op defaults where the caller should be required to provide the dependency
- helper confetti: one-call helpers, forwarding helpers, or helpers that only return an object literal
- spread fog: object spreads hiding the final shape, especially conditional spreads and repeated `{ ...thing, extra }` projections
- fake extensibility: hooks, options bags, strategies, providers, adapters, or managers with one real use
- error laundering: `try/catch` that only rewrites an internal error or logs below the top-level boundary
- type erosion: `unknown`, `Record<string, unknown>`, casts, `Pick`, or `Omit` where a named domain type should exist
- schema drift: hand-written JSON Schema plus manual parsing, or duplicate schema/type/runtime descriptions
- defensive defaults: empty objects, empty arrays, `"<unknown>"`, or no-op callbacks hiding programmer errors
- compatibility debt without compatibility: legacy/private migration paths where we own all callers
- manager/service mush: vague classes or modules collecting unrelated behavior

For each finding:
1. Point to the file and line.
2. Name the slop category.
3. Say why this is not a real boundary, or identify the real boundary if there is one.
4. Say what the canonical type, schema, or owner should be.
5. Say what should be deleted, inlined, or made required.
6. Say whether the fix is "edit the owner", "delete the wrapper", "make the dependency required", or "rewrite the module".

Rules:
- If we own every caller, update callers directly.
- Validate at external boundaries only.
- Make required state required.
- Prefer one canonical shape at the source.
- Prefer Zod schema plus inferred type for tool/input contracts.
- Delete adapters, wrappers, defaults, and hooks that do not protect a real public boundary.
- Throw upward except at top-level operational boundaries.
```
