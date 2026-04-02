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

**Rule:** Do not choose Next.js by default. Use Astro for content sites, a frontend SPA plus a separate backend for SaaS apps, and only reach for Next.js in the narrow cases where SEO and highly interactive route-level rendering genuinely both matter.

See also: [Opinionated Stack](stack-overview.md).

## Why agents get this wrong

Agents pattern-match on popularity. They see "React app" and reach for Next.js because it is the loudest framework in the ecosystem, not because it is the cleanest fit for the problem.

That default choice drags in a lot of architecture you may not want:

- a blurred frontend/backend boundary
- server-side rendering complexity for pages that do not need it
- React Server Components and other framework-specific behavior that makes the codebase harder to reason about
- deployment assumptions that are most stable on Vercel, even if alternative runtimes exist

This is especially bad for teams that want a clean separation between a static site, a product SPA, and a backend API. (which I recomend you build for 99% of web projects)

## What to do instead

Choose the tool based on the actual product shape:

- For landing pages, blogs, docs, and marketing content: use Astro.
- For SaaS product UIs: use a frontend SPA with TanStack Router.
- For the backend: use a separate backend such as Cloudflare Workers.

This keeps the architecture explicit:

- the content site is a content site
- the product app is a product app
- the backend is a backend

You avoid the muddy middle where one framework tries to be a static site generator, an application server, an API layer, and a deployment platform abstraction all at once.

### Why this stack is usually better

- Astro handles content-heavy SEO work better than forcing Next.js onto marketing pages.
- A standalone SPA keeps application concerns out of your content site.
- A separate backend gives you a clear API boundary instead of framework-coupled server code.
- Vercel lock-in pressure is lower when the architecture is not centered on Next.js in the first place.

### The narrow exception

Use Next.js only when both of these are true:

1. SEO matters on a large set of highly interactive routes.
2. The product genuinely benefits from route-level server rendering instead of a static site plus a separate app/backend split.

The most plausible example is a complex e-commerce site. That is an exception, not the default.

## Example

```text
Product shape: landing page plus SaaS dashboard

- Marketing site: Astro
- App: React SPA with TanStack Router
- Backend: Cloudflare Workers
- Shared versions: Astro, React, and TanStack Router come from workspace catalog entries
```

Example implements: [Do Not Use Next.js](do-not-use-nextjs.md), [Opinionated Stack](stack-overview.md), [Catalog Dependencies](catalog-dependencies.md).
## The test

Before choosing Next.js, ask:

- Is this really a content site that Astro would handle more simply?
- Is this really a SaaS app that should just be a SPA plus a clean backend?
- Am I choosing Next.js because the product needs it, or because the ecosystem defaults to it?
- Would this architecture be clearer if the frontend and backend were separate?

If those questions point toward simpler boundaries, do not use Next.js.
