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

**Rule:** Delete data-shape hops, call wrappers, and helper-specific object projections that do not add an invariant, policy, lifecycle guarantee, or real ownership boundary.

See also: [Resolve Uncertainty Into Contracts](../foundations/resolve-uncertainty-into-contracts.md), [Edit Real Owners](./edit-real-owners.md), and [Build Deep Modules, Not Shallow Abstractions](../abstractions/build-deep-modules-not-shallow-abstractions.md).

## Why agents get this wrong

Agents are too respectful of existing shapes. They preserve old helper splits by adding `Input`, `Context`, `Params`, `State`, or `Result` types, then wrap those shapes in functions that only forward arguments. They also add TypeScript `Pick`, TypeScript `Omit`, or `{ ...input, extra }` projections so each helper can declare the exact fields it reads. The code looks organized locally, but no new fact becomes true.

That is fake structure. It deepens the call graph, blurs ownership, and gives future agents more useless patterns to copy.

## What to do instead

Keep one canonical internal shape inside a subsystem unless another shape earns its keep. Passing a full typed object to a helper that reads only part of it is not a smell. Creating a second shape for that helper is.

Keep a layer only when it does at least one real job:
- validates untrusted input
- enforces a domain invariant
- crosses a real subsystem or vendor boundary
- performs an irreversible transformation
- owns retry, auth, logging, cleanup, or error normalization
- guarantees resource setup and teardown

If the layer only renames fields, repackages the same values, forwards arguments, spreads an object into nearly the same object, or preserves a helper boundary that no longer matters, delete it.

If the change belongs in an existing owner, edit that owner directly. Do not add a sibling helper just to avoid touching the real decision point.

## Example

Bad: this invents a target shape, a projection helper, and a one-use runner. The client lifecycle is real work, but the generic runner is the wrong owner because the only caller needs the sync policy beside it.

```typescript
type SyncRepositoryParams = {
  installation: RepositoryInstallation;
  repositoryId: RepositoryId;
};

type UpstreamTarget = Pick<RepositoryInstallation, 'upstreamServerId'>;
function toUpstreamTarget(installation: RepositoryInstallation): UpstreamTarget {
  return { upstreamServerId: installation.upstreamServerId };
}
async function runRepositorySync(target: UpstreamTarget, repositoryId: RepositoryId) {
  const client = await connectUpstreamClient(target.upstreamServerId);
  try {
    return await client.syncRepository(repositoryId);
  } finally {
    await client.close();
  }
}
export async function syncRepository(input: SyncRepositoryParams) {
  return runRepositorySync(toUpstreamTarget(input.installation), input.repositoryId);
}
```

Good: keep one owned shape and put the lifecycle where the workflow is actually decided.

```typescript
type SyncRepositoryResult =
  | { status: 'synced' }
  | { status: 'skipped'; reason: 'archived' };

type SyncRepositoryInput = {
  installation: RepositoryInstallation;
  repositoryId: RepositoryId;
};

export async function syncRepository(input: SyncRepositoryInput): Promise<SyncRepositoryResult> {
  const client = await connectUpstreamClient(input.installation.upstreamServerId);
  try {
    const upstreamRepository = await client.getRepository(input.repositoryId);
    if (upstreamRepository.archived) {
      return { status: 'skipped', reason: 'archived' };
    }
    await client.syncRepository(input.repositoryId, {
      tenantId: input.installation.tenantId,
      requestedByUserId: input.installation.connectedByUserId,
    });
    return { status: 'synced' };
  } finally {
    await client.close();
  }
}
```

Example implements: [Delete Fake Layers](./delete-fake-layers.md), [Edit Real Owners](./edit-real-owners.md), [Build Deep Modules, Not Shallow Abstractions](../abstractions/build-deep-modules-not-shallow-abstractions.md).

## The test

Ask what becomes true after the layer runs. If the honest answer is "same data, different name," "same call, different function," or "same object, fewer fields," delete the layer.
