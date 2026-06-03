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

That layer often looks reasonable: `normalizeInput`, `toRuntimeContext`, `createDefaultOptions`, `adaptPayload`, TypeScript `Pick`, TypeScript `Omit`, `input?.field ?? fallback`, conditional object spreads, or a `try/catch` around a private helper.

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
- canonical objects over helper-specific TypeScript `Pick`, TypeScript `Omit`, or `Params` shapes inside owned code
- explicit object construction over spread fog
- direct optional field assignment inside internal TypeScript shapes
- throwing upward over local error laundering
- editing the real owner over wrapper helpers

Do not treat unused fields on a typed object as a problem by themselves. A private helper signature is not a public contract unless it protects a real boundary.

For internal TypeScript objects, assigning `undefined` to an optional field is usually fine. Prefer direct construction:

```typescript
const nextState: ReviewRunState = {
  status,
  completedAt,
};
```

Do not turn that into noisy mutation unless property presence is part of the contract:

```typescript
const nextState: ReviewRunState = { status };
if (completedAt !== undefined) {
  nextState.completedAt = completedAt;
}
```

Reserve guarded assignment for exact returned result shapes, persisted records, public wire payloads, or code that checks `"field" in obj`. Otherwise, the guard preserves no useful distinction and makes object construction harder to review.

## Example

```text
Bad: callBrowserMcpTool accepts an optional createHandlerContext callback, invents createDefaultHandlerContext, spreads the callback result into { args }, and tolerates missing context.

Good: callBrowserMcpTool accepts a required HandlerContext value. Production builds it at the browser-tool boundary. Tests pass the minimal valid context. Missing context is a programmer error, not a runtime branch.
```

Example implements: [Resolve Uncertainty Into Contracts](./resolve-uncertainty-into-contracts.md), [Delete Fake Layers](../deletion/delete-fake-layers.md), [Boundaries Validate, Internals Trust](../boundaries/boundaries-validate-internals-trust.md), [No Backwards Compatibility Shims](../deletion/no-backwards-compat-shims.md).
