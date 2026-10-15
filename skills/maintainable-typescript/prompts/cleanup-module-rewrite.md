# Cleanup Module Rewrite

Use this to remove helper chains, wrappers, and types that only rename another type.

```text
Rewrite this module around the code that owns each behavior.

Rules:
- Keep the exported API and observable behavior unless I approve a contract change.
- Edit the owning code directly when requirements change.
- Delete pass-through wrappers, sibling helpers, and rename-only types.
- Add `Input`, `Context`, `Params`, `State`, or `Result` types only when they enforce a new invariant, boundary, or lifecycle guarantee.
- Catch errors only when the function owns retry, fallback, cleanup, or boundary translation.
- Inline or delete helpers that only forward arguments.
- Use one direct module rewrite rather than refactoring each helper separately.

Before editing:
1. List the contracts to preserve.
2. List owners that only delegate, wrappers, and rename-only types to delete.
3. Name the owner of each important behavior.
4. Identify any helper worth keeping and explain why.

Then rewrite the module to make that ownership and flow clear.
```
