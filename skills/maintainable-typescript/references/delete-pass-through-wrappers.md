---
example:
  primary: delete-pass-through-wrappers
  format: code
  implements:
    - delete-pass-through-wrappers
    - build-deep-modules-not-shallow-abstractions
    - delete-shape-churn
---
# Delete Pass-Through Wrappers

**Rule:** Do not wrap a library call, helper, or module unless the wrapper adds policy, normalization, ownership, or lifecycle guarantees.

See also: [Build Deep Modules, Not Shallow Abstractions](build-deep-modules-not-shallow-abstractions.md) and [Delete Shape Churn](delete-shape-churn.md).

## Why agents get this wrong

Agents are overly respectful of boundaries that already exist. They preserve old module splits by creating `createClientOptions`, `resolveProvider`, `connectClient`, and similar wrappers even when each function only forwards arguments. The call graph gets deeper, but the interface does not get simpler.

## What to do instead

Call the dependency directly when the dependency already expresses the operation clearly.

This rule is about redundant call layers. If the real problem is rename-only types or fake `Input` / `Context` hops, that belongs in [Delete Shape Churn](delete-shape-churn.md). If the real problem is that the requirement change landed beside the owner instead of inside it, that belongs in [Edit Real Owners](edit-real-owners.md).

Keep the wrapper only if it gives callers something durable:
- retries, auth, logging, or error normalization the app owns
- resource setup and guaranteed cleanup
- contract normalization across a vendor boundary
- one stable policy point shared by real callers

If the wrapper only preserves a layer that used to exist, remove it.

## Example

```typescript
async function withClient<T>(
  serverUrl: string,
  operation: (client: Client) => Promise<T>,
  provider?: OAuthClientProvider,
): Promise<T> {
  const transport = new StreamableHTTPClientTransport(new URL(serverUrl), {
    authProvider: provider,
  });
  const client = new Client(CLIENT_INFO, { capabilities: {} });

  await client.connect(transport);

  try {
    return await operation(client);
  } finally {
    await client.close();
  }
}
```

Example implements: [Delete Pass-Through Wrappers](delete-pass-through-wrappers.md), [Build Deep Modules, Not Shallow Abstractions](build-deep-modules-not-shallow-abstractions.md), [Delete Shape Churn](delete-shape-churn.md).
## The test

If deleting the wrapper and calling the underlying API directly would lose nothing important, delete the wrapper.
