---
example:
  primary: use-the-design-system-not-ad-hoc-tailwind
  format: code
  implements:
    - use-the-design-system-not-ad-hoc-tailwind
    - stack-overview
    - monorepo-package-boundaries
---
# Use the Design System, Not Ad Hoc Tailwind

**Rule:** Use existing design-system components, tokens, and patterns. Get human approval before adding a missing primitive to the system.

See also: [Opinionated Stack](./stack-overview.md).

## Why agents get this wrong

Local Tailwind choices create competing colors, spacing, and components that spread when later changes copy them.

## What to do instead

Before writing UI code:

1. Find and use the existing component or variant.
2. Use semantic tokens and established spacing, radius, typography, and state patterns.
3. If the system cannot meet the requirement, stop and ask for human approval.
4. After approval, add the token, variant, or component to the design system, then use it in feature code.

Keep new tokens and primitives in the design system. Do not introduce raw colors, one-off spacing, or custom styling in a feature to bypass it.

## Example

```typescript
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';

export function UpgradeBanner() {
  return (
    <Card className="border-border bg-accent text-accent-foreground">
      <h2 className="text-title-sm">Upgrade to Pro</h2>
      <p className="text-body-sm">
        Unlock repository-wide review queues and audit history.
      </p>
      <Button variant="primary">Upgrade</Button>
    </Card>
  );
}
```

Example implements: [Use the Design System, Not Ad Hoc Tailwind](./use-the-design-system-not-ad-hoc-tailwind.md), [Opinionated Stack](./stack-overview.md), [Monorepo Package Boundaries](../doctrine/packages/monorepo-package-boundaries.md).
