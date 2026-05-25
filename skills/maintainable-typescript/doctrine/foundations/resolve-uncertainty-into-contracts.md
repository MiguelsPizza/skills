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

Agents preserve uncertainty. When they do not know whether a caller can change, whether a field is required, whether a boundary is real, or whether a shape is canonical, they add a small layer that makes the immediate edit feel safer.

That layer often looks reasonable: `normalizeInput`, `toRuntimeContext`, `createDefaultOptions`, `adaptPayload`, `input?.field ?? fallback`, conditional object spreads, or a `try/catch` around a private helper.

But the codebase now contains the agent's uncertainty as executable structure. Future agents copy that structure, and the repo accumulates fake flexibility.

## What to do instead

Use this test:

1. Do we own every caller and callee?
2. Is this a real boundary: network, disk, database, browser message, tool input, CLI input, environment, public package export, or third-party API?
3. What uncertainty is this layer preserving?
4. Could the source type or schema make that uncertainty impossible?
5. What would become simpler if the repo had one canonical shape?

If the boundary is not real and the callers are owned, update the callers and delete the layer.

Prefer:
- required fields over optional callbacks plus defaults
- named domain types over `Record<string, unknown>`
- one Zod schema plus inferred type over parallel schemas and parsers
- explicit object construction over spread fog
- throwing upward over local error laundering
- editing the real owner over wrapper helpers

## Example

```text
Bad: callBrowserMcpTool accepts an optional createHandlerContext callback, invents createDefaultHandlerContext, spreads the callback result into { args }, and tolerates missing context.

Good: callBrowserMcpTool requires createHandlerContext because production execution always needs a real browser-tool context. Tests pass the minimal context explicitly. Missing context is a programmer error, not a runtime branch.
```

Example implements: [Resolve Uncertainty Into Contracts](./resolve-uncertainty-into-contracts.md), [Delete Fake Layers](../deletion/delete-fake-layers.md), [Boundaries Validate, Internals Trust](../boundaries/boundaries-validate-internals-trust.md), [No Backwards Compatibility Shims](../deletion/no-backwards-compat-shims.md).
