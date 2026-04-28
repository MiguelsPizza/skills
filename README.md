# Agent Opinions

Opinionated skills and tooling for making AI coding agents leave codebases more maintainable than they found them.

## Repo Layout

- [Maintainable TypeScript](skills/maintainable-typescript/README.md) is the strict TypeScript maintainability skill. Its source lives in [skills/maintainable-typescript](skills/maintainable-typescript), and its uploadable archive lives at [skills/maintainable-typescript.zip](skills/maintainable-typescript.zip).
- [WebMCP Designer](skills/webmcp-designer/README.md) is a skill for designing WebMCP instrumentation on existing web apps. Its source lives in [skills/webmcp-designer](skills/webmcp-designer), and its uploadable archive lives at [skills/webmcp-designer.zip](skills/webmcp-designer.zip).
- [tooling/README.md](tooling/README.md) documents the standalone TypeScript maintenance tooling templates.
- [AGENTS.md](AGENTS.md) is the contributor guide for editing skill doctrine in this repo.
- [how-to-write-skill-guide/README.md](how-to-write-skill-guide/README.md) is the reference copy of Anthropic’s skill-building guide.

## Install

**Vercel Skills CLI**

```bash
npx skills add miguelspizza/skills
```

Or install one skill:

```bash
npx skills add miguelspizza/skills --skill maintainable-typescript
npx skills add miguelspizza/skills --skill webmcp-designer
```

**Claude Code plugin**

```text
/plugin marketplace add miguelspizza/skills
/plugin install skills@miguelspizza-skills
```

**Claude.ai standalone skill**

Upload [skills/maintainable-typescript.zip](skills/maintainable-typescript.zip) or [skills/webmcp-designer.zip](skills/webmcp-designer.zip) in **Customize > Skills**.

## Build

```bash
./scripts/build-skill-archive.sh
./scripts/build-skill-archive.sh webmcp-designer
./scripts/build-skill-archive.sh all
```

Those commands regenerate one or more skill archives from the corresponding folders in [skills/](skills/).
