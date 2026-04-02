---
example:
  primary: naming-is-navigation
  format: text
  implements:
    - naming-is-navigation
    - one-concept-per-file
    - monorepo-package-boundaries
---
# Naming Is Navigation

**Rule:** Every file, directory, variable, and function name must be self-explanatory to someone (or an agent) seeing the codebase for the first time. Names are the primary way AI agents navigate — bad names mean bad navigation, bad context, and bad code generation.

See also: [One Concept Per File](one-concept-per-file.md) and [Monorepo Package Boundaries](monorepo-package-boundaries.md).

## Why agents get this wrong

Agents name things generically. They create `utils.ts`, `helpers.ts`, `types.ts`, `index.ts`, `data.ts`, `constants.ts` (singular, catch-all). They name variables `result`, `data`, `response`, `item`, `temp`. Every new session starts by reading file names to build a mental map — generic names force the agent to open every file to understand what it does.

## What to do instead

Name by domain and behavior, not by implementation bucket:
- directories should tell you which part of the system they own
- files should tell you the single responsibility inside them
- variables should describe the thing, not its type
- functions should read like an action on a domain concept
- booleans should read like true/false questions

If a name would force a new contributor to open the file just to learn what it contains, the name is too vague.

This is why barrel files are bad navigation. `index.ts` tells you nothing about ownership.

## Example

```text
packages/webhook-auth/src/verify-webhook-signature.ts
packages/github-client/src/get-installation-token.ts
apps/api/src/routes/create-review-run.ts
apps/api/src/features/review-runs/create-review-run.ts
apps/api/src/features/review-runs/load-webhook-pull-request.ts
```

Example implements: [Naming Is Navigation](naming-is-navigation.md), [One Concept Per File](one-concept-per-file.md), [Monorepo Package Boundaries](monorepo-package-boundaries.md).
