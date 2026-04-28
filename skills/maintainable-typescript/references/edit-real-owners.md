---
example:
  primary: edit-real-owners
  format: code
  implements:
    - edit-real-owners
    - delete-pass-through-wrappers
    - delete-shape-churn
---
# Edit Real Owners

**Rule:** When requirements change, edit the function or module that truly owns the behavior. Do not preserve existing function shapes with wrappers, sibling helpers, or rename-only adapters.

See also: [Delete Pass-Through Wrappers](delete-pass-through-wrappers.md), [Delete Shape Churn](delete-shape-churn.md), and [Write for the Agent Era](write-for-the-agent-era.md).

## Why agents get this wrong

Agents are structurally conservative about function shapes. If a helper already exists, they would rather keep it and add `WithCurrency`, `buildContext`, or `getLocalizedPrice` beside it than change the real owner directly. That feels safer because callers keep working and the diff stays local.

The result is fake cleanliness. The old structure survives, the new requirement lives in adjacent helpers, and ownership gets blurrier with every edit.

## What to do instead

Find the place that actually owns the decision, policy, or invariant, and edit that place.

This rule is about change ownership. If the bad layer is just a forwarding call, use [Delete Pass-Through Wrappers](delete-pass-through-wrappers.md). If the bad layer is a rename-only type or shape translation, use [Delete Shape Churn](delete-shape-churn.md).

If the current function is only forwarding arguments, it is not the owner. Delete it and update callers to use the real owner directly.

Ask this in review:
- Which function should future changes land in first?
- Does this new helper make that answer clearer or fuzzier?
- If I wrote this flow fresh today, would I keep this function boundary?

If the answer is "no," stop preserving the shape.

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

Example implements: [Edit Real Owners](edit-real-owners.md), [Delete Pass-Through Wrappers](delete-pass-through-wrappers.md), [Delete Shape Churn](delete-shape-churn.md).
## The smell

If a requirement change produces `getPriceWithX`, `buildXContext`, or `toXInput` instead of an edit to the real owner, the code is preserving shape instead of truth.
