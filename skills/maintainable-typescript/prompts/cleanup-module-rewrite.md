# Cleanup Module Rewrite

Use this when a model keeps preserving helper chains, wrapper functions, and rename-only types.

```text
Clean up this module, but do not preserve its current helper split just because it already exists.

Rules:
- Keep the exported API and externally observable behavior the same unless I explicitly approve a contract change.
- Edit the real owner directly when requirements changed.
- Delete pass-through wrappers, sibling helpers, and rename-only types.
- Do not introduce new `Input`, `Context`, `Params`, `State`, or `Result` types unless a new invariant, boundary, or lifecycle guarantee becomes true.
- Do not introduce TypeScript `Pick`, TypeScript `Omit`, spread-built helper inputs, or subset client interfaces for private functions. Pass the canonical domain object, existing named input, or real client/class type through the owned workflow. Zod/drizzle-zod projections are fine for real contract schemas.
- Do not add local try/catch blocks unless this function owns retry, fallback, cleanup, or boundary translation.
- If a helper only forwards arguments, inline it or delete it.
- If a helper only adds, removes, or renames fields from an object, inline it or delete it.
- For internal TypeScript object construction, assign optional fields directly. Use guarded `if (value !== undefined) obj.field = value` mutation only when property presence is part of the contract.
- Prefer one direct rewrite of the module over a helper-by-helper refactor.

Before editing:
1. List the contracts that must stay stable.
2. List the fake owners, wrapper functions, rename-only types, and shape projections to delete.
3. Name the real owner for each important behavior.
4. Say whether any existing helper actually earns its existence. If so, why.

Then perform one rewrite that makes the flow direct and truthful.
```
