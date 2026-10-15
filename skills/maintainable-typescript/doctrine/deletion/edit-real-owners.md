---
example:
  primary: edit-real-owners
  format: code
  implements:
    - edit-real-owners
    - delete-fake-layers
    - write-for-the-agent-era
---
# Edit Real Owners

**Rule:** Change behavior in its owning function or module. Remove wrappers, sibling helpers, and rename-only adapters that preserve obsolete structure.

See also: [Delete Fake Layers](./delete-fake-layers.md) and [Write for the Agent Era](../foundations/write-for-the-agent-era.md).

## Why agents get this wrong

Adding `WithCurrency`, `buildContext`, or `getLocalizedPrice` beside an existing helper can split one behavior across several functions. The original function survives while new requirements accumulate around it, obscuring ownership.

## What to do instead

Find the function that owns the decision, policy, or invariant, and edit it.

Use [Delete Fake Layers](./delete-fake-layers.md) for forwarding calls, rename-only types, and shape translations.

If the current function is only forwarding arguments, it is not the owner. Delete it and update callers to use the real owner directly.

Keep function boundaries that make the owner clear and fit the current workflow. Delete boundaries you would omit when writing the flow today.

## Example

```typescript
export async function getDisplayPrice(
  productId: string,
  customerGroup: CustomerGroup,
  currency: Currency = 'USD',
) {
  const price = await pricingApi.getPrice(productId, currency);
  return applyCustomerDiscount(price, customerGroup);
}
```

Example implements: [Edit Real Owners](./edit-real-owners.md), [Delete Fake Layers](./delete-fake-layers.md), [Write for the Agent Era](../foundations/write-for-the-agent-era.md).
