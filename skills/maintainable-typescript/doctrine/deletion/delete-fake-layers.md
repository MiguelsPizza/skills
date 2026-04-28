---
example:
  primary: delete-fake-layers
  format: code
  implements:
    - delete-fake-layers
    - edit-real-owners
    - build-deep-modules-not-shallow-abstractions
---
# Delete Fake Layers

**Rule:** Delete data-shape hops and call wrappers that do not add an invariant, policy, lifecycle guarantee, or real ownership boundary.

See also: [Edit Real Owners](./edit-real-owners.md) and [Build Deep Modules, Not Shallow Abstractions](../abstractions/build-deep-modules-not-shallow-abstractions.md).

## Why agents get this wrong

Agents are too respectful of existing shapes. They preserve old helper splits by adding `Input`, `Context`, `Params`, `State`, or `Result` types, then wrap those shapes in functions that only forward arguments. The code looks organized locally, but no new fact becomes true.

That is fake structure. It deepens the call graph, blurs ownership, and gives future agents more useless patterns to copy.

## What to do instead

Keep one canonical internal shape inside a subsystem unless another shape earns its keep.

Keep a layer only when it does at least one real job:
- validates untrusted input
- enforces a domain invariant
- crosses a real subsystem or vendor boundary
- performs an irreversible transformation
- owns retry, auth, logging, cleanup, or error normalization
- guarantees resource setup and teardown

If the layer only renames fields, repackages the same values, forwards arguments, or preserves a helper boundary that no longer matters, delete it.

If the change belongs in an existing owner, edit that owner directly. Do not add a sibling helper just to avoid touching the real decision point.

## Example

```typescript
type UpstreamTarget = {
  tenantId: string;
  userId: string;
  upstreamServerId: string;
};

async function withUpstreamClient<T>(
  target: UpstreamTarget,
  operation: (client: UpstreamClient) => Promise<T>,
): Promise<T> {
  const client = await connectUpstreamClient(target.upstreamServerId);

  try {
    return await operation(client);
  } finally {
    await client.close();
  }
}

export async function syncRepository(input: {
  target: UpstreamTarget;
  repositoryId: string;
}) {
  return withUpstreamClient(input.target, (client) => {
    return client.syncRepository(input.repositoryId);
  });
}
```

Example implements: [Delete Fake Layers](./delete-fake-layers.md), [Edit Real Owners](./edit-real-owners.md), [Build Deep Modules, Not Shallow Abstractions](../abstractions/build-deep-modules-not-shallow-abstractions.md).

## The test

Ask what becomes true after the layer runs. If the honest answer is "same data, different name" or "same call, different function," delete the layer.
