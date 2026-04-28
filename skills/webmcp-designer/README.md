# WebMCP Designer

Doctrine for designing WebMCP instrumentation on existing web applications.

## Why This Exists

Most WebMCP guidance explains how to register a tool. That is not enough. A usable WebMCP surface also needs route design, context scoping, mutation discipline, and workflow guidance that maps to real user stories.

This skill treats WebMCP as agent accessibility for a human-facing product. It is opinionated on purpose.

## What's In Here

- [SKILL.md](SKILL.md) is the skill entrypoint.
- [references/](references) contains the portable doctrine for fitting WebMCP into an existing app.
- [opinionated-stack/](opinionated-stack) contains the house blueprint for composing route tools, module-local wrappers, and user-story skills in a React or JavaScript SPA.

## Source Of Truth

- Use the MCP-B docs server `docs.mcp-b.ai/mcp` for exact syntax when it is available in the user's MCP client.
- Otherwise use the first-party docs at `https://docs.mcp-b.ai/`.
- Use this skill for concepts, tool design, workflow structure, and app-shaping decisions.

## Full Pass

If the task is a full WebMCP design pass, a full review pass, or an edit to this skill itself, read every file in [references/](references) in the order listed in [SKILL.md](SKILL.md).

## Build The ZIP Locally

```bash
./scripts/build-skill-archive.sh webmcp-designer
```

That generates [skills/webmcp-designer.zip](../../skills/webmcp-designer.zip) from [skills/webmcp-designer/](../../skills/webmcp-designer).

## Opinions Index

### Framing & Fit

- [First-Party Docs Define Runtime Syntax](references/first-party-docs-define-runtime-syntax.md)
- [Design for Agent Accessibility](references/design-for-agent-accessibility.md)
- [Route Maps Drive Discovery](references/route-maps-drive-discovery.md)

### Tool Placement & Behavior

- [Read Tools Live at Data Boundaries](references/read-tools-live-at-data-boundaries.md)
- [Tool Types Have Clear Boundaries](references/tool-types-have-clear-boundaries.md)
- [Stage Forms, Then Commit](references/stage-forms-then-commit.md)

### Tool Design

- [Capabilities Over Click Targets](references/capabilities-over-click-targets.md)
- [Tool Descriptions Are Local Contracts](references/tool-descriptions-are-local-contracts.md)

### Workflow Guidance

- [User Stories Drive Web Skills](references/user-stories-drive-web-skills.md)

### House Blueprint

- [Start Here](opinionated-stack/start-here.md)
- [Implementation Patterns](opinionated-stack/implementation-patterns.md)
- [One-Pass Instrumentation Plan](opinionated-stack/one-pass-instrumentation-plan.md)
- [Module-Local WebMCP Directories](opinionated-stack/module-local-webmcp-directories.md)
- [Thin Wrappers Over Existing Logic](opinionated-stack/thin-wrappers-over-existing-logic.md)

## Contributing

See [AGENTS.md](../../AGENTS.md) for the contributor guide and repository rules.
