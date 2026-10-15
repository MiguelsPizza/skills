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

Agents repeat boundary validation inside utilities and private methods. Redundant checks obscure where untrusted data enters and add unnecessary work.

## What to do instead

Validate untrusted data once when it enters the system:

**Validate:**

- HTTP request bodies
- Webhook payloads
- WebSocket messages
- URL parameters
- Form input
- External API responses
- Tool call arguments (from agents/LLMs)
- Environment variables at startup

**Trust:**

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

Example implements: [Boundaries Validate, Internals Trust](./boundaries-validate-internals-trust.md), [No Defensive Catches](./no-defensive-catches.md), [No Defensive Null Checks](./no-defensive-null-checks.md).
