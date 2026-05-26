---
example:
  primary: make-prose-specific
  format: text
  implements:
    - make-prose-specific
    - reject-stock-ai-writing
    - lead-with-the-point
---
# Make Prose Specific

**Rule:** Replace generic claims with the concrete actor, object, constraint, and consequence.

See also: [Reject Stock AI Writing](./reject-stock-ai-writing.md) and [Lead With the Point](./lead-with-the-point.md).

## Why agents get this wrong

Agents reach for portable language because it works almost anywhere: "robust," "seamless," "powerful," "important," "improved," "better developer experience." That portability is the problem. A sentence that fits every project usually teaches nothing about this project.

## What to do instead

Write the fact that would let a maintainer act correctly later.

Replace:
- qualities with observable behavior
- broad nouns with named systems
- vague benefits with the removed failure mode
- generic advice with the actual rule

Specific prose does not need to be fancy. It needs to be hard to transplant into another repo.

## Example

```text
Bad:
This provides a more seamless and reliable documentation experience.

Good:
Move API parameter descriptions into the Zod schema so generated docs and runtime validation read from the same field owner.
```

Example implements: [Make Prose Specific](./make-prose-specific.md), [Reject Stock AI Writing](./reject-stock-ai-writing.md), [Lead With the Point](./lead-with-the-point.md).

## The test

If the sentence still sounds true after replacing the project nouns with unrelated ones, it is too generic.
