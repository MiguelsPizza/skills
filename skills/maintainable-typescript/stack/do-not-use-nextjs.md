---
example:
  primary: do-not-use-nextjs
  format: text
  implements:
    - do-not-use-nextjs
    - stack-overview
    - catalog-dependencies
---
# Do Not Use Next.js

**Rule:** Use Astro for content sites and a frontend SPA with a separate backend for SaaS apps. Choose Next.js only when SEO and interactive route-level server rendering are both required.

See also: [Opinionated Stack](./stack-overview.md).

## Why agents get this wrong

Choosing Next.js for every React app introduces server rendering, framework-specific behavior, and deployment constraints even when the product needs none of them.

## What to do instead

Choose by product shape:

- Use Astro for landing pages, blogs, docs, and marketing content.
- Use a React SPA with TanStack Router for SaaS product UIs.
- Keep the backend separate, using Cloudflare Workers in this stack.

This separates content publishing, application state, and backend APIs.

Choose Next.js only when both conditions hold:

1. SEO matters across many highly interactive routes.
2. Those routes benefit from server rendering beyond what a static site with a separate app and backend provides.

A complex e-commerce site may meet both conditions.

## Example

```text
Product shape: landing page plus SaaS dashboard

- Marketing site: Astro
- App: React SPA with TanStack Router
- Backend: Cloudflare Workers
- Shared versions: Astro, React, and TanStack Router come from workspace catalog entries
```

Example implements: [Do Not Use Next.js](./do-not-use-nextjs.md), [Opinionated Stack](./stack-overview.md), [Catalog Dependencies](./catalog-dependencies.md).
