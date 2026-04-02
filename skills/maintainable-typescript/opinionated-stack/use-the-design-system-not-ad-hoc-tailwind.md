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

**Rule:** In codebases with an existing design system, use its components, tokens, and patterns. Do not invent new Tailwind styling ad hoc. If the system is missing something, get human approval and add it to the design system first.

See also: [Opinionated Stack](stack-overview.md).

## Why agents get this wrong

Agents optimize for the local diff. They see a UI task and reach for whatever Tailwind classes seem visually plausible: `bg-blue-600`, `rounded-xl`, `px-3`, `text-zinc-700`, custom shadows, arbitrary spacing. It works in the screenshot, but it bypasses the system the rest of the app depends on.

This creates visual drift, duplicate primitives, and one-off exceptions that spread quickly. The next agent copies the local pattern instead of the canonical one. Soon the codebase has five button styles, three card paddings, and raw colors that don't map to any shared token.

## What to do instead

Before writing UI code:

1. Find the existing component for the job and use it
2. Use semantic tokens, not raw colors or one-off values
3. Follow the established spacing, radius, typography, and state patterns already in the app
4. If the design system does not support the requirement, stop and ask for human approval
5. After approval, add the missing token, variant, or component to the design system, then consume it from feature code

Do not add local design tokens inside a feature just to get a screen done. A missing system primitive is a design-system change, not a leaf-component shortcut.

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

Example implements: [Use the Design System, Not Ad Hoc Tailwind](use-the-design-system-not-ad-hoc-tailwind.md), [Opinionated Stack](stack-overview.md), [Monorepo Package Boundaries](../references/monorepo-package-boundaries.md).
## The test

If a UI change introduces raw Tailwind colors, one-off spacing, new token names, or custom component styling in feature code, ask:

- Does the design system already have a component or variant for this?
- Am I bypassing semantic tokens with raw visual values?
- Should this be added centrally before any feature uses it?

If the answer to any of those is yes, do not ship the local styling.
