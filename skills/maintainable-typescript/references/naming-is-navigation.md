---
example:
  primary: naming-is-navigation
  format: text
  implements:
    - naming-is-navigation
    - split-by-stable-seam
    - monorepo-package-boundaries
---
# Naming Is Navigation

**Rule:** Every package, path segment, file, variable, and function name must be self-explanatory to someone seeing the repo for the first time. Agents learn a codebase by grepping the tree, so names must tell them where to go before they open a file.

See also: [Split By Stable Seam](split-by-stable-seam.md) and [Monorepo Package Boundaries](monorepo-package-boundaries.md).

## Why agents get this wrong

Agents name things generically. They create `utils.ts`, `helpers.ts`, `types.ts`, `index.ts`, `data.ts`, `constants.ts` (singular, catch-all). They name variables `result`, `data`, `response`, `item`, `temp`. Every new session starts by reading file names to build a mental map — generic names force the agent to open every file to understand what it does.

## What to do instead

Name paths so they answer three questions immediately:
- what kind of owner is this package?
- what domain or resource is this path about?
- what stable boundary does this file own?

Name by domain and ownership, not by implementation bucket:
- packages should tell you what kind of truth they own
- directories should tell you what domain or resource they own
- files should tell you which stable subsystem or boundary they own inside that area
- variables should describe the thing, not its type
- functions should read like an action on a domain concept
- booleans should read like true/false questions

Import paths are part of navigation too:
- use short relative imports for nearby files
- use an app alias such as `@/` for nonlocal imports within the same app
- use package or subpath imports across package boundaries
- avoid deep traversal imports like `../../../../foo` because they hide ownership and break easily when code moves

If a name would force a new contributor to open the file just to learn what it contains, the name is too vague.

This is why barrel files are bad navigation. `index.ts` tells you nothing about ownership.

## Example

```text
packages/db/src/todos.ts
packages/contracts/src/todos.ts
apps/agent/src/orpc/routers/todos.ts
apps/agent/src/auth/github-client.ts
apps/agent/src/auth/browser-routes.ts
```

Example implements: [Naming Is Navigation](naming-is-navigation.md), [Split By Stable Seam](split-by-stable-seam.md), [Monorepo Package Boundaries](monorepo-package-boundaries.md).
