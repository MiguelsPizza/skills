---
example:
  primary: lead-with-the-point
  format: text
  implements:
    - lead-with-the-point
    - reject-stock-ai-writing
    - make-prose-specific
---
# Lead With the Point

**Rule:** Start with the useful claim, instruction, or decision. Do not warm up with framing.

See also: [Reject Stock AI Writing](./reject-stock-ai-writing.md) and [Make Prose Specific](./make-prose-specific.md).

## Why agents get this wrong

Agents open with throat-clearing because it sounds polite and complete. They write "It is important to note," "In today's landscape," or a suspenseful contrast before stating the thing the reader came for. This makes docs slower and trains future edits to add more setup instead of more information.

## What to do instead

Put the answer, action, or decision in the first sentence. Then add only the context needed to use it correctly.

Good openings usually say one of these:
- what to do
- what changed
- what failed
- what decision was made
- what constraint controls the rest of the page

If the first sentence can be deleted without changing the document's meaning, delete it.

## Example

```text
Bad:
When working with complex documentation systems, it is important to consider how readers navigate information.

Good:
Put tutorials, how-to guides, reference, and explanation on separate pages.
```

Example implements: [Lead With the Point](./lead-with-the-point.md), [Reject Stock AI Writing](./reject-stock-ai-writing.md), [Make Prose Specific](./make-prose-specific.md).

## The test

If the reader must finish the first paragraph before discovering the page's job, the opening is too slow.
