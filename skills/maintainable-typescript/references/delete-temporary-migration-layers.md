---
example:
  primary: delete-temporary-migration-layers
  format: text
  implements:
    - delete-temporary-migration-layers
    - delete-obsolete-code
    - no-backwards-compat-shims
---
# Delete Temporary Migration Layers

**Rule:** If you add an abstraction layer only to support a migration or cutover, delete it as soon as the old path is gone.

See also: [Delete Obsolete Code](delete-obsolete-code.md) and [No Backwards Compatibility Shims](no-backwards-compat-shims.md).

## Why agents get this wrong

Agents often keep temporary compatibility layers because deleting them feels risky. A migration adapter, dual-write helper, or branch-by-abstraction seam survives after the old implementation is removed, and the codebase inherits a permanent layer whose job is already finished.

## What to do instead

Treat migration seams as scaffolding, not architecture.

Before keeping the layer, ask:
- does it still hide a live vendor or protocol boundary?
- does it still support multiple implementations?
- does it still own a policy the application needs?

If the answer is no, remove it in the same cleanup that finishes the migration. Update callers to the final interface instead of preserving the temporary one forever.

## Example

```text
Bad: old client -> migration adapter -> new client
Good after cutover: caller -> new client
```

Example implements: [Delete Temporary Migration Layers](delete-temporary-migration-layers.md), [Delete Obsolete Code](delete-obsolete-code.md), [No Backwards Compatibility Shims](no-backwards-compat-shims.md).
## The exception

During the migration, the layer can be justified. After the migration, it must re-earn its keep like any other abstraction.
