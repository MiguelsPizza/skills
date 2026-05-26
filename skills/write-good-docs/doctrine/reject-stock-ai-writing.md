---
example:
  primary: reject-stock-ai-writing
  format: text
  implements:
    - reject-stock-ai-writing
    - lead-with-the-point
    - make-prose-specific
---
# Reject Stock AI Writing

**Rule:** Do not ship prose that sounds generated; write the specific thing the reader needs to know.

See also: [Lead With the Point](./lead-with-the-point.md), [Make Prose Specific](./make-prose-specific.md), and [AI Writing Tropes to Avoid](../references/ai-writing-tropes/SKILL.md).

## Why agents get this wrong

Agents default to presentation before substance. They pad simple claims with contrast pairs, repeated fragments, theatrical rhythm, empty intensifiers, and generic transitions. The prose feels polished locally, but it teaches the repo a bad voice: docs become sales copy, comments become captions, errors become vague reassurance, and PRs stop naming the actual constraint.

The obvious tells change. Today it might be double-spaced micro-paragraphs, "not X, but Y," overuse of "quietly," or a final sentence that inflates the point. Tomorrow it will be another pattern. The real smell is prose that performs certainty without adding information.

## What to do instead

Make the sentence earn its place. Name the actor, the action, the constraint, and the consequence. Cut rhythm that exists only to sound emphatic. Cut abstract praise. Cut summary lines that restate the previous paragraph.

Use plain writing for:
- docs
- READMEs
- prompts and skill instructions
- PR descriptions
- commit messages
- code comments
- error messages

The reader should learn something they can use: what changed, why it changed, what breaks, what contract matters, or what decision future maintainers should preserve.

## Example

```text
Bad:
Not just another cleanup. Not another refactor. Not another pass.

This change quietly unlocks a cleaner, more robust foundation for future work.

Good:
Remove the duplicate schema wrapper and route both callers through `createOrderInputSchema`.

The old wrapper accepted untrimmed coupon codes, so keeping it would preserve two validation paths for the same request.
```

Example implements: [Reject Stock AI Writing](./reject-stock-ai-writing.md), [Lead With the Point](./lead-with-the-point.md), [Make Prose Specific](./make-prose-specific.md).

## The test

If the sentence could fit almost any doc, PR, or codebase after changing a noun, delete it or make it specific.
