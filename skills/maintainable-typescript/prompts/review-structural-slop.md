# Review Structural Slop

Use this to review a diff or file for unnecessary structure and missed cleanup.

```text
Review cleanup, refactoring, and generated code for unnecessary structure and unclear contracts.

Report findings without praise. Identify the type, schema, owner, or boundary that should enforce each contract.

Look specifically for:
- internal shape conversions: `normalize*`, `to*`, `map*`, `adapt*`, `coerce*`, `Input`, `Context`, `Params`, `State`, or `Result` shapes between internal callers
- redundant validation: validation, fallback, or compatibility code inside typed internal code
- unnecessary optionality: `input?.field`, optional callbacks, or no-op defaults for required dependencies
- forwarding helpers: one-call helpers, argument forwarding, or helpers that only return an object literal
- hidden object shapes: spreads that hide the final shape, including conditional spreads and repeated `{ ...thing, extra }` projections
- unused extension points: hooks, options bags, strategies, providers, adapters, or managers with one real use
- error rewriting: `try/catch` that only rewrites an internal error or logs below the top-level boundary
- weakened types: `unknown`, `Record<string, unknown>`, casts, `Pick`, or `Omit` replacing a named domain type
- duplicate schemas: hand-written JSON Schema with manual parsing, or duplicate schema, type, and runtime descriptions
- defaults hiding errors: empty objects, empty arrays, `"<unknown>"`, or no-op callbacks masking programmer errors
- unneeded compatibility: legacy or private migration paths when we own all callers
- unrelated responsibilities: vague classes or modules collecting unrelated behavior

For each finding:
1. Point to the file and line.
2. Name the category.
3. Identify the real boundary, or explain why there is none.
4. Name the canonical type, schema, or owner.
5. State what to delete, inline, or make required.
6. Classify the fix as "edit the owner", "delete the wrapper", "make the dependency required", or "rewrite the module".

Rules:
- Update callers directly when we own them all.
- Validate at external boundaries only.
- Make required state required.
- Define one canonical shape at the source.
- Use Zod schemas with inferred types for tool and input contracts.
- Delete adapters, wrappers, defaults, and hooks that protect no public boundary.
- Let errors propagate to top-level operational boundaries.
```
