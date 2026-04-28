---
example:
  primary: do-not-use-builders-for-plain-data
  format: code
  implements:
    - do-not-use-builders-for-plain-data
    - ssot-or-die
    - no-type-casts
---
# Do Not Use Builders for Plain Data

**Rule:** Do not wrap plain data construction in a builder. In TypeScript, object literals plus `satisfies` are usually clearer and infer better.

See also: [SSOT or Die](ssot-or-die.md) and [No Type Casts](no-type-casts.md).

## Why agents get this wrong

Agents do not usually reach for builders unless the prompt, author, or repo already points them there. But once that style is present, they copy Java and C# habits into TypeScript and create `new UserBuilder().withId(id).withEmail(email).build()` for values that are just data. That adds ceremony, spreads field ownership across methods, and makes it harder to see the final shape.

## What to do instead

If you are constructing one value, write one value. Use:
- object literals for assembly
- `satisfies` to verify shape without destroying inference
- plain functions only when you are deriving or validating data, not when you are just naming fields

Use a builder only when each step changes the available operations or the type guarantees. If `.build()` just returns the same object shape you could have written inline, the builder is dead weight.

## Example

```typescript
const user = {
  id: userId,
  email,
  role: 'admin',
  isActive: true,
} satisfies User;
```

Example implements: [Do Not Use Builders for Plain Data](do-not-use-builders-for-plain-data.md), [SSOT or Die](ssot-or-die.md), [No Type Casts](no-type-casts.md).
## The rule of thumb

If the builder only exists to avoid writing `{ ... }`, delete it.
