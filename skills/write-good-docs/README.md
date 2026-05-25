# Write Good Docs

Documentation-writing skill for useful docs: Diataxis structure, audience-specific READMEs, and prose cleanup for common AI-writing tropes.

## Why This Exists

Agents often produce documentation that is fluent but poorly shaped: tutorials mixed with reference, READMEs aimed at nobody in particular, and prose that sounds machine-generated. This skill gives agents a small routing system before they write.

## What's In Here

- [SKILL.md](SKILL.md) is the skill entrypoint.
- [references/diataxis/](references/diataxis) contains the Diataxis framework reference for tutorials, how-to guides, reference, and explanation.
- [references/crafting-effective-readmes/](references/crafting-effective-readmes) contains README templates, checklists, and style guidance.
- [references/ai-writing-tropes/](references/ai-writing-tropes) contains prose cleanup guidance for avoiding predictable AI-writing patterns.

## Install

**Vercel Skills CLI**

```bash
npx skills add miguelspizza/skills --skill write-good-docs
```

Use `--list` to see all available skills in this repo, or `--all` to install everything:

```bash
npx skills add miguelspizza/skills --list
npx skills add miguelspizza/skills --all
```

**Claude Code plugin**

```text
/plugin marketplace add miguelspizza/skills
/plugin install skills@miguelspizza-skills
```

**Claude.ai standalone skill**

Download the published `write-good-docs.zip` archive, then upload it in **Customize > Skills**.

**Build the ZIP locally**

```bash
./scripts/build-skill-archive.sh write-good-docs
```

That regenerates [skills/write-good-docs.zip](../../skills/write-good-docs.zip) from [skills/write-good-docs/](../../skills/write-good-docs).

## Source Notes

Diataxis reference content comes from [diataxis.fr](https://diataxis.fr/) by Daniele Procida.

The README and AI-writing trope references are adapted from Joshua David Thomas's [agent-skills](https://github.com/joshuadavidthomas/agent-skills) repository:

- [ai-writing-tropes](https://github.com/joshuadavidthomas/agent-skills/tree/main/ai-writing-tropes)
- [crafting-effective-readmes](https://github.com/joshuadavidthomas/agent-skills/tree/main/crafting-effective-readmes)

## Contributing

See [AGENTS.md](../../AGENTS.md) for the contributor guide and repository rules.
