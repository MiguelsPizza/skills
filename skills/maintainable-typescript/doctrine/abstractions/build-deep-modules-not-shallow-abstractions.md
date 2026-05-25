---
example:
  primary: build-deep-modules-not-shallow-abstractions
  format: code
  implements:
    - build-deep-modules-not-shallow-abstractions
    - resolve-uncertainty-into-contracts
    - naming-is-navigation
---
# Build Deep Modules, Not Shallow Abstractions

**Rule:** Hide meaningful complexity behind a small interface. Do not split one concept into a maze of tiny files and pass-through helpers.

See also: [Resolve Uncertainty Into Contracts](../foundations/resolve-uncertainty-into-contracts.md), [Delete Fake Layers](../deletion/delete-fake-layers.md), and [Naming Is Navigation](../foundations/naming-is-navigation.md).

## Why agents get this wrong

Agents hear "small functions" and take it literally. They split one subsystem into `parse-foo.ts`, `validate-foo.ts`, `normalize-foo.ts`, and `execute-foo.ts` even when those pieces have no life outside one feature. The call graph gets longer while the interface gets no simpler.

## What to do instead

Make the interface small and the ownership obvious. Let the module absorb the internal steps if they are only meaningful together. A module is deep when callers can use it through a simple contract without knowing its internal choreography.

Split a module only when the new module has independent callers, tests, or domain meaning. Do not split because a helper can be named.

## Example

```typescript
export async function verifyWebhookRequest(
  request: Request,
  secret: string,
): Promise<VerifiedWebhookEvent> {
  const rawBody = await request.text();
  const signature = readWebhookSignature(request.headers);
  assertValidWebhookSignature({ rawBody, secret, signature });
  return parseWebhookEvent(rawBody);
}
```

Example implements: [Build Deep Modules, Not Shallow Abstractions](./build-deep-modules-not-shallow-abstractions.md), [Resolve Uncertainty Into Contracts](../foundations/resolve-uncertainty-into-contracts.md), [Naming Is Navigation](../foundations/naming-is-navigation.md).
## The smell

If understanding one action requires opening five sibling files with nearly identical names, the abstraction is shallow.
