---
example:
  primary: boundaries-validate-internals-trust
  format: code
  implements:
    - boundaries-validate-internals-trust
    - no-defensive-catches
    - no-defensive-null-checks
---
# Boundaries Validate, Internals Trust

**Rule:** Validate data at system edges — HTTP handlers, webhook receivers, tool payloads, user input. Internal functions trust their callers.

## Why agents get this wrong

Agents validate everywhere. They add Zod parsing inside utility functions, runtime type checks in private methods, and parameter validation in functions that are only called by other functions in the same module. This creates layers of redundant validation that slow execution and obscure the actual trust boundaries.

## What to do instead

Draw a clear line between trusted and untrusted zones:

**Untrusted (validate here):**
- HTTP request bodies
- Webhook payloads
- WebSocket messages
- URL parameters
- Form input
- External API responses
- Tool call arguments (from agents/LLMs)
- Environment variables at startup

**Trusted (don't validate here):**
- Function calls within the same module
- Arguments passed between internal services
- Data already parsed at the boundary
- Return values from your own database queries
- Values from your own type-safe ORM

## Example

```typescript
import {
  createOrderInputSchema,
  type CreateOrderInput,
} from '@repo/contracts/orders/order';
import { publicProcedure } from '../orpc';

export const createOrderPreview = publicProcedure
  .input(createOrderInputSchema)
  .handler(async ({ input }) => {
    return { totalCents: calculateOrderTotal(input.items) };
  });

function calculateOrderTotal(items: CreateOrderInput['items']): number {
  return items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
}
```

Example implements: [Boundaries Validate, Internals Trust](boundaries-validate-internals-trust.md), [No Defensive Catches](no-defensive-catches.md), [No Defensive Null Checks](no-defensive-null-checks.md).
