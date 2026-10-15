---
example:
  primary: resolve-uncertainty-into-contracts
  format: text
  implements:
    - resolve-uncertainty-into-contracts
    - delete-fake-layers
    - boundaries-validate-internals-trust
    - no-backwards-compat-shims
---
# Resolve Uncertainty Into Contracts

**Rule:** Do not encode uncertainty as adapters, defaults, optionals, spreads, or catch blocks. Resolve it into the owned contract.

See also: [Delete Fake Layers](../deletion/delete-fake-layers.md), [Boundaries Validate, Internals Trust](../boundaries/boundaries-validate-internals-trust.md), [No Backwards Compatibility Shims](../deletion/no-backwards-compat-shims.md), and [Your Pattern Will Be Copied](./your-pattern-will-be-copied.md).

## Why agents get this wrong

Unclear ownership or requirements can lead to adapters, optional fields, defaults, conditional spreads, and catches around private helpers. These layers preserve ambiguity in executable code, which later changes copy.

## What to do instead

Before adding a layer:

1. Identify the owners of every caller and callee.
2. Identify any external boundary: network, disk, database, browser message, tool input, CLI input, environment, public package export, or third-party API.
3. Resolve ambiguous requirements in the source type or schema.
4. Use one canonical shape where possible.

For owned callers with no external boundary, update the callers and delete the layer.

Require fields the workflow needs. Use named domain types, one Zod schema with an inferred type, and explicit object construction. Let errors propagate to their handling boundary, and edit the owning function directly.

## Example

```text
Bad: callBrowserMcpTool accepts an optional createHandlerContext callback, invents createDefaultHandlerContext, spreads the callback result into { args }, and tolerates missing context.

Good: callBrowserMcpTool requires createHandlerContext because production execution always needs a real browser-tool context. Tests pass the minimal context explicitly. Missing context is a programmer error, not a runtime branch.
```

Example implements: [Resolve Uncertainty Into Contracts](./resolve-uncertainty-into-contracts.md), [Delete Fake Layers](../deletion/delete-fake-layers.md), [Boundaries Validate, Internals Trust](../boundaries/boundaries-validate-internals-trust.md), [No Backwards Compatibility Shims](../deletion/no-backwards-compat-shims.md).
