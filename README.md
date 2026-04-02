# Agent Opinions

Opinionated skills and tooling for making AI coding agents leave TypeScript codebases more maintainable than they found them.

## Repo Layout

- [Maintainable TypeScript](skills/maintainable-typescript/README.md) is the current published skill. Its source lives in [skills/maintainable-typescript](skills/maintainable-typescript), and its uploadable archive lives at [skills/maintainable-typescript.zip](skills/maintainable-typescript.zip).
- [tooling/README.md](tooling/README.md) documents the standalone TypeScript maintenance tooling templates.
- [AGENTS.md](AGENTS.md) is the contributor guide for editing the Maintainable TypeScript doctrine in this repo.
- [how-to-write-skill-guide/README.md](how-to-write-skill-guide/README.md) is the reference copy of Anthropic’s skill-building guide.

## Install

**Vercel Skills CLI**

```bash
npx skills add miguelspizza/skills
```

Or install just the maintainable-typescript skill:

```bash
npx skills add miguelspizza/skills --skill maintainable-typescript
```

**Claude Code plugin**

```text
/plugin marketplace add miguelspizza/skills
/plugin install skills@miguelspizza-skills
```

**Claude.ai standalone skill**

Upload [skills/maintainable-typescript.zip](skills/maintainable-typescript.zip) in **Customize > Skills**.

## Build

```bash
./scripts/build-skill-archive.sh
```

That regenerates [skills/maintainable-typescript.zip](skills/maintainable-typescript.zip) from [skills/maintainable-typescript](skills/maintainable-typescript).
