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

See also: [Resolve Uncertainty Into Contracts](../foundations/resolve-uncertainty-into-contracts.md), [Edit Real Owners](./edit-real-owners.md), and [Build Deep Modules, Not Shallow Abstractions](../abstractions/build-deep-modules-not-shallow-abstractions.md).

## Why agents get this wrong

Extra `Input`, `Context`, `Params`, `State`, or `Result` types can preserve obsolete helper boundaries. Wrappers that only forward those values deepen the call graph without enforcing any policy.

## What to do instead

Keep one canonical internal shape per subsystem unless another shape serves a distinct purpose.

Keep a layer only when it:

- validates untrusted input
- enforces a domain invariant
- crosses a real subsystem or vendor boundary
- performs an irreversible transformation
- owns retry, auth, logging, cleanup, or error normalization
- guarantees resource setup and teardown

Delete layers that only rename fields, repackage values, forward arguments, or preserve obsolete boundaries.

Edit the existing owner when it owns the behavior being changed.

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
