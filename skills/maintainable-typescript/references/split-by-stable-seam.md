---
example:
  primary: split-by-stable-seam
  format: text
  implements:
    - split-by-stable-seam
    - naming-is-navigation
    - monorepo-package-boundaries
---
# Split By Stable Seam

**Rule:** In a TypeScript monorepo, split code by stable ownership seams. Packages usually own a kind of truth, paths inside them own a domain or resource, and files own stable boundaries inside that area.

See also: [Naming Is Navigation](naming-is-navigation.md) and [Monorepo Package Boundaries](monorepo-package-boundaries.md).

## Why agents get this wrong

Agents hear "single-purpose files" and choose the safest literal interpretation: one exported function per file. They also copy framework folklore like controllers, models, or services without checking how the current repo actually signals ownership. That produces trees that are technically organized but hard to predict.

## What to do instead

Use this navigation order:

1. Package: what kind of truth or runtime does this package own?
2. Path: what domain or resource is this about?
3. File: what stable boundary inside that area owns this behavior?

Common package ownership:
- `packages/db` owns persistence schema and DB-derived types
- `packages/contracts` owns canonical contracts
- `apps/agent/src/orpc` owns runtime API procedures and routers
- `apps/web` owns UI behavior

Inside each owner, split by domain or resource:
- `todos`
- `auth`
- `installations`
- `review-runs`

Inside that area, use files for stable boundaries a contributor would predict:
- `packages/db/src/todos.ts`
- `packages/contracts/src/todos.ts`
- `apps/agent/src/orpc/routers/todos.ts`
- `apps/agent/src/auth/cookies.ts`
- `apps/agent/src/auth/session.ts`

Use a directory only when that domain has multiple durable seams. If the package and filename already make ownership obvious, prefer the simpler path.

Do not split just because a helper can be named. If understanding one slice requires opening a chain of tiny files such as `read-session-cookie.ts`, `seal-session-cookie.ts`, and `clear-session-cookie.ts`, the slice is over-split. Merge those siblings into the subsystem file they already describe.

Before creating a file, ask:
- does this boundary carry durable domain meaning?
- would a first-time contributor predict this path exists?
- would merging it into its sibling improve scanability?

If the boundary is mechanical instead of meaningful, do not create it.

## Example

```text
packages/db/src/todos.ts
packages/contracts/src/todos.ts
apps/agent/src/orpc/routers/todos.ts
apps/agent/src/auth/cookies.ts
apps/agent/src/auth/session.ts
```

Example implements: [Split By Stable Seam](split-by-stable-seam.md), [Naming Is Navigation](naming-is-navigation.md), [Monorepo Package Boundaries](monorepo-package-boundaries.md).
