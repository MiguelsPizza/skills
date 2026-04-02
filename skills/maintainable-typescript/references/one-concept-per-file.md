---
example:
  primary: one-concept-per-file
  format: text
  implements:
    - one-concept-per-file
    - naming-is-navigation
    - monorepo-package-boundaries
---
# One Concept Per File

**Rule:** Each file contains one domain concept. Name the file after that concept. Split when a file serves two purposes. Merge is never the answer to organization problems.

See also: [Naming Is Navigation](naming-is-navigation.md) and [No Barrel Exports](no-barrel-exports.md).

## Why agents get this wrong

Agents append to existing files. Need a new type? Add it to `types.ts`. New constant? Add it to `constants.ts`. New helper? Add it to `utils.ts`. Files grow unbounded because agents don't split proactively — they follow the path of least resistance.

## What to do instead

Split files by domain concept, not by artifact type:
- `users/user.ts`, not `types.ts`
- `review-runs/review-run.ts`, not `review-run-id.ts` plus `review-run-status.ts`
- `webhook-auth/verify-webhook-signature.ts`, not `github.ts` with four unrelated responsibilities
- `github/connect-repository.ts`, not one file per request schema, response schema, and error payload

Do not hide multiple concepts behind `index.ts`. If the file is only there to gather sibling exports, delete it and import from the owning module instead.

For the house stack, one concept can be one domain aggregate or one feature boundary. A well-documented `users/user.ts` file may own the related schemas and inferred types for the user domain. Splitting every exported value into its own file is not the goal.

An owning module is not a junk drawer. `review-runs/review-run.ts` is a good path only while it still represents one review-run concept. If it starts mixing unrelated helpers, transport-specific code, or values that only half the consumers need, split it again by concept rather than introducing generic buckets.

Split when:
- the file has two responsibilities
- half the imports are only used by half the file
- the filename is generic enough to hide what is inside

## Example

```text
users/user.ts
review-runs/review-run.ts
webhook-auth/verify-webhook-signature.ts
github/connect-repository.ts
```

Example implements: [One Concept Per File](one-concept-per-file.md), [Naming Is Navigation](naming-is-navigation.md), [Monorepo Package Boundaries](monorepo-package-boundaries.md).
