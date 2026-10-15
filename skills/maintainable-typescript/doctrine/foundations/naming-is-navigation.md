---
example:
  primary: naming-is-navigation
  format: text
  implements:
    - naming-is-navigation
    - build-deep-modules-not-shallow-abstractions
    - monorepo-package-boundaries
---
# Naming Is Navigation

**Rule:** Name packages, paths, files, variables, and functions so a new contributor can identify their purpose without opening every file.

See also: [Build Deep Modules, Not Shallow Abstractions](../abstractions/build-deep-modules-not-shallow-abstractions.md) and [Monorepo Package Boundaries](../packages/monorepo-package-boundaries.md).

## Why agents get this wrong

Catch-all files such as `utils.ts`, `helpers.ts`, and `types.ts` hide their domain. Generic variables such as `data`, `item`, and `temp` force readers to trace assignments to understand them.

## What to do instead

Name packages for the responsibility they own, directories for their domain or resource, and files for the coherent behavior within that area. Name variables for the thing they hold, functions for actions on domain concepts, and booleans as true/false questions.

Import paths are part of navigation too:

- use short relative imports for nearby files
- use an app alias such as `@/` for nonlocal imports within the same app
- use package or subpath imports across package boundaries
- avoid deep traversal imports like `../../../../foo` because they hide ownership and break easily when code moves

A filename such as `index.ts` works when its directory identifies the owner and the file defines its exports. Follow [No Re-exports](../packages/no-re-exports.md) for declaration ownership.

## Example

```text
packages/db/src/todos.ts
packages/contracts/src/todos.ts
apps/agent/src/orpc/routers/todos.ts
apps/agent/src/auth/github-client.ts
apps/agent/src/auth/browser-routes.ts
```

Example implements: [Naming Is Navigation](./naming-is-navigation.md), [Build Deep Modules, Not Shallow Abstractions](../abstractions/build-deep-modules-not-shallow-abstractions.md), [Monorepo Package Boundaries](../packages/monorepo-package-boundaries.md).
