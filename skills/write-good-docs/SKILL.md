---
name: write-good-docs
description: Write, review, and restructure useful documentation with Diataxis, audience-specific README patterns, and AI-writing trope cleanup. Use when creating docs, improving READMEs, reorganizing documentation, or editing prose for clarity.
---

# Write Good Docs

Use this skill when documentation needs to become more useful, not merely longer.

## Layout

- [`doctrine/`](doctrine/) contains portable rules for useful documentation and non-generic prose.
- [`references/diataxis/`](references/diataxis/) contains the Diataxis framework reference for classifying documentation into tutorials, how-to guides, reference, and explanation.
- [`references/crafting-effective-readmes/`](references/crafting-effective-readmes/) contains README templates, checklists, and style guidance.
- [`references/ai-writing-tropes/`](references/ai-writing-tropes/) contains prose cleanup guidance for removing common AI-generated writing tells.

## Reading Order

Do not read the whole skill directory by default.

1. Classify the documentation task.
2. Load only the relevant reference area below.
3. Write or edit the docs.
4. Apply the doctrine rules for direct, specific prose.
5. Run the AI-writing trope check before finalizing prose.

## Task Router

### Writing or reorganizing documentation

Start with Diataxis:

- [`references/diataxis/compass.md`](references/diataxis/compass.md)
- [`references/diataxis/how-to-use-diataxis.md`](references/diataxis/how-to-use-diataxis.md)

Then read the page-type reference that matches the job:

- Tutorials: [`references/diataxis/tutorials.md`](references/diataxis/tutorials.md)
- How-to guides: [`references/diataxis/how-to-guides.md`](references/diataxis/how-to-guides.md)
- Reference: [`references/diataxis/reference.md`](references/diataxis/reference.md)
- Explanation: [`references/diataxis/explanation.md`](references/diataxis/explanation.md)

Use the boundary references when content is mixed:

- [`references/diataxis/tutorials-how-to.md`](references/diataxis/tutorials-how-to.md)
- [`references/diataxis/reference-explanation.md`](references/diataxis/reference-explanation.md)
- [`references/diataxis/complex-hierarchies.md`](references/diataxis/complex-hierarchies.md)

### Creating or improving a README

Read:

- [`references/crafting-effective-readmes/SKILL.md`](references/crafting-effective-readmes/SKILL.md)
- [`references/crafting-effective-readmes/section-checklist.md`](references/crafting-effective-readmes/section-checklist.md)
- [`references/crafting-effective-readmes/style-guide.md`](references/crafting-effective-readmes/style-guide.md)

Choose the template that matches the audience:

- Open source: [`references/crafting-effective-readmes/templates/oss.md`](references/crafting-effective-readmes/templates/oss.md)
- Internal: [`references/crafting-effective-readmes/templates/internal.md`](references/crafting-effective-readmes/templates/internal.md)
- Personal: [`references/crafting-effective-readmes/templates/personal.md`](references/crafting-effective-readmes/templates/personal.md)
- Config: [`references/crafting-effective-readmes/templates/xdg-config.md`](references/crafting-effective-readmes/templates/xdg-config.md)

### Editing prose that sounds machine-generated

Read:

- [`doctrine/reject-stock-ai-writing.md`](doctrine/reject-stock-ai-writing.md)
- [`doctrine/lead-with-the-point.md`](doctrine/lead-with-the-point.md)
- [`doctrine/make-prose-specific.md`](doctrine/make-prose-specific.md)
- [`references/ai-writing-tropes/SKILL.md`](references/ai-writing-tropes/SKILL.md)
- The specific trope file that matches the draft's problem: word choice, sentence structure, paragraph structure, tone, formatting, or composition.

## Diataxis Compass

Use this table to classify docs:

| If the content... | ...and serves the user's... | ...then it belongs in... |
|---|---|---|
| informs action | acquisition of skill | a tutorial |
| informs action | application of skill | a how-to guide |
| informs cognition | application of skill | reference |
| informs cognition | acquisition of skill | explanation |

Ask:

1. Is this about doing something or knowing something?
2. Is the user learning or working?

## Defaults

- One page should have one primary job.
- Tutorials teach by doing; they are safe, concrete, and teacher-led.
- How-to guides help a competent user complete a real task.
- Reference describes machinery accurately and tersely.
- Explanation develops understanding, context, and tradeoffs.
- READMEs answer the audience's first real questions.
- Prose should be specific, direct, and varied enough to avoid obvious AI-writing patterns.

## Sources

- Diataxis reference content comes from [diataxis.fr](https://diataxis.fr/) by Daniele Procida.
- README guidance is adapted from [joshuadavidthomas/agent-skills/crafting-effective-readmes](https://github.com/joshuadavidthomas/agent-skills/tree/main/crafting-effective-readmes) at commit `8730dd4838e423949e3ea5853aee05fdd2a33a08`.
- AI-writing trope guidance is adapted from [joshuadavidthomas/agent-skills/ai-writing-tropes](https://github.com/joshuadavidthomas/agent-skills/tree/main/ai-writing-tropes) at commit `8730dd4838e423949e3ea5853aee05fdd2a33a08`.
