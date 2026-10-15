# Agent Opinions

Opinionated skills and tooling for making AI coding agents leave codebases more maintainable than they found them.

## Repo Layout

- [Maintainable TypeScript](skills/maintainable-typescript/README.md) is the strict TypeScript maintainability skill. Its source lives in [skills/maintainable-typescript](skills/maintainable-typescript), and its uploadable archive lives at [skills/maintainable-typescript.zip](skills/maintainable-typescript.zip).
- [Oxlint Maintainability](skills/oxlint-maintainability/SKILL.md) installs executable enforcement for the TypeScript doctrine, with optional house-stack and type-aware presets. Its [coverage map](skills/oxlint-maintainability/references/coverage.md) records what is enforced and what still needs review.
- [WebMCP Designer](skills/webmcp-designer/README.md) is a skill for designing WebMCP instrumentation on existing web apps. Its source lives in [skills/webmcp-designer](skills/webmcp-designer), and its uploadable archive lives at [skills/webmcp-designer.zip](skills/webmcp-designer.zip).
- [Write Good Docs](skills/write-good-docs/README.md) is a skill for writing, restructuring, and reviewing documentation with Diataxis, README templates, and AI-writing trope cleanup. Its source lives in [skills/write-good-docs](skills/write-good-docs), and its uploadable archive lives at [skills/write-good-docs.zip](skills/write-good-docs.zip).
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

Those commands regenerate one or more skill archives from the corresponding folders in [skills/](skills/).

For the executable rules:

```sh
pnpm install --frozen-lockfile
pnpm check
./scripts/build-skill-archive.sh oxlint-maintainability
```

Tests exercise the shipped plugin with Oxlint's RuleTester and CLI, including a copied installation in a fresh consumer repository. The rule/skill delivery follows [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop); policies are mapped to this repository's doctrine.
