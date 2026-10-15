# Agent Opinions

Skills and tools for maintainable code, agent interfaces, and clear documentation.

## Repo Layout

- [Maintainable TypeScript](skills/maintainable-typescript/README.md): rules for strict TypeScript. [Source](skills/maintainable-typescript), [ZIP](skills/maintainable-typescript.zip).
- [Oxlint Maintainability](skills/oxlint-maintainability/SKILL.md): lint rules and optional stack/type-aware presets. See the [coverage map](skills/oxlint-maintainability/references/coverage.md).
- [WebMCP Designer](skills/webmcp-designer/README.md): agent interfaces for existing web apps. [Source](skills/webmcp-designer), [ZIP](skills/webmcp-designer.zip).
- [Write Good Docs](skills/write-good-docs/README.md): writing and editing with Diataxis, README templates, and prose checks. [Source](skills/write-good-docs), [ZIP](skills/write-good-docs.zip).
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
npx skills add miguelspizza/skills --skill oxlint-maintainability
npx skills add miguelspizza/skills --skill webmcp-designer
npx skills add miguelspizza/skills --skill write-good-docs
```

**Claude Code plugin**

```text
/plugin marketplace add miguelspizza/skills
/plugin install skills@miguelspizza-skills
```

**Claude.ai standalone skill**

Upload [skills/maintainable-typescript.zip](skills/maintainable-typescript.zip), [skills/oxlint-maintainability.zip](skills/oxlint-maintainability.zip), [skills/webmcp-designer.zip](skills/webmcp-designer.zip), or [skills/write-good-docs.zip](skills/write-good-docs.zip) in **Customize > Skills**.

## Build

```bash
./scripts/build-skill-archive.sh
./scripts/build-skill-archive.sh webmcp-designer
./scripts/build-skill-archive.sh write-good-docs
./scripts/build-skill-archive.sh all
```

Build archives from their folders in [skills/](skills/).

For the executable rules:

```sh
pnpm install --frozen-lockfile
pnpm check
./scripts/build-skill-archive.sh oxlint-maintainability
```

Tests run the shipped plugin through RuleTester, the CLI, and a fresh consumer install. Rule structure and installation follow [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop).
