---
name: webmcp-designer
description: Designs and reviews WebMCP instrumentation for existing web apps, especially SPAs. Use when adding agent-accessible tools, route maps, prompts, or WebMCP workflows to a React, Vue, Angular, or vanilla browser app, or when deciding whether WebMCP is the right fit.
metadata:
  docs-server: docs.mcp-b.ai/mcp
  public-docs: https://docs.mcp-b.ai/
---

# WebMCP Designer

Use this skill when the project needs WebMCP design doctrine, not just ad hoc tool registration.

## Layout

- [`doctrine/`](doctrine/) contains the portable doctrine for designing WebMCP on an existing human-facing product.
- [`stack/`](stack/) contains the house blueprint for instrumenting a React or JavaScript SPA with `WebMCP/` directories, module-local tool wrappers, and thin execute bodies.

## First move

Do not guess the runtime surface or memorize API details.

1. Ask whether the MCP-B docs server at `docs.mcp-b.ai/mcp` is available in the user's MCP client.
2. If it is available, inspect that server and use it as the source of truth for exact tool syntax and package details.
3. If it is not available, read the first-party docs at `https://docs.mcp-b.ai/` before making implementation claims.
4. Use this skill for architecture, tool shape, workflow design, and scope decisions.
5. Use the docs server or first-party docs for exact package names, hook signatures, polyfill choices, and annotation details.

## Reading order

Normal task:

1. Read this file first.
2. Decide whether the task needs only portable doctrine or the full house blueprint.
3. Load the smallest relevant set of doctrine files.
4. Treat the rest of the skill as reference material.

If the task is implementing WebMCP in a React or JavaScript SPA with this house layout, read [`stack/start-here.md`](./stack/start-here.md) before the route-specific doctrine files.

Full design pass, full review pass, or editing this skill:

Read every file in `doctrine/` in this order:

1. [`doctrine/first-party-docs-define-runtime-syntax.md`](./doctrine/first-party-docs-define-runtime-syntax.md)
2. [`doctrine/design-for-agent-accessibility.md`](./doctrine/design-for-agent-accessibility.md)
3. [`doctrine/route-maps-drive-discovery.md`](./doctrine/route-maps-drive-discovery.md)
4. [`doctrine/read-tools-live-at-data-boundaries.md`](./doctrine/read-tools-live-at-data-boundaries.md)
5. [`doctrine/tool-types-have-clear-boundaries.md`](./doctrine/tool-types-have-clear-boundaries.md)
6. [`doctrine/stage-forms-then-commit.md`](./doctrine/stage-forms-then-commit.md)
7. [`doctrine/capabilities-over-click-targets.md`](./doctrine/capabilities-over-click-targets.md)
8. [`doctrine/tool-descriptions-are-local-contracts.md`](./doctrine/tool-descriptions-are-local-contracts.md)
9. [`doctrine/user-stories-drive-web-skills.md`](./doctrine/user-stories-drive-web-skills.md)

If the task is a full implementation blueprint for the house stack, then read all of:

1. [`stack/start-here.md`](./stack/start-here.md)
2. [`stack/one-pass-instrumentation-plan.md`](./stack/one-pass-instrumentation-plan.md)
3. [`stack/implementation-patterns.md`](./stack/implementation-patterns.md)

Default backbone for most app work:

- [`doctrine/first-party-docs-define-runtime-syntax.md`](./doctrine/first-party-docs-define-runtime-syntax.md)
- [`doctrine/design-for-agent-accessibility.md`](./doctrine/design-for-agent-accessibility.md)
- [`doctrine/route-maps-drive-discovery.md`](./doctrine/route-maps-drive-discovery.md)
- [`doctrine/read-tools-live-at-data-boundaries.md`](./doctrine/read-tools-live-at-data-boundaries.md)
- [`doctrine/tool-types-have-clear-boundaries.md`](./doctrine/tool-types-have-clear-boundaries.md)
- [`doctrine/user-stories-drive-web-skills.md`](./doctrine/user-stories-drive-web-skills.md)

## Task Router

Use the smallest relevant set.

### Decide whether WebMCP is the right fit

- [`doctrine/first-party-docs-define-runtime-syntax.md`](./doctrine/first-party-docs-define-runtime-syntax.md)
- [`doctrine/design-for-agent-accessibility.md`](./doctrine/design-for-agent-accessibility.md)
- [`doctrine/route-maps-drive-discovery.md`](./doctrine/route-maps-drive-discovery.md)

### Instrument a route map or top-level navigation layer

- [`doctrine/route-maps-drive-discovery.md`](./doctrine/route-maps-drive-discovery.md)
- [`doctrine/user-stories-drive-web-skills.md`](./doctrine/user-stories-drive-web-skills.md)
- [`doctrine/tool-descriptions-are-local-contracts.md`](./doctrine/tool-descriptions-are-local-contracts.md)

### Add read-only tools for data inspection

- [`doctrine/first-party-docs-define-runtime-syntax.md`](./doctrine/first-party-docs-define-runtime-syntax.md)
- [`doctrine/read-tools-live-at-data-boundaries.md`](./doctrine/read-tools-live-at-data-boundaries.md)
- [`doctrine/capabilities-over-click-targets.md`](./doctrine/capabilities-over-click-targets.md)
- [`doctrine/tool-descriptions-are-local-contracts.md`](./doctrine/tool-descriptions-are-local-contracts.md)

### Add sub-navigation, tabs, or other SPA context switches

- [`doctrine/tool-types-have-clear-boundaries.md`](./doctrine/tool-types-have-clear-boundaries.md)
- [`doctrine/route-maps-drive-discovery.md`](./doctrine/route-maps-drive-discovery.md)

### Add forms, mutations, or other state-changing flows

- [`doctrine/first-party-docs-define-runtime-syntax.md`](./doctrine/first-party-docs-define-runtime-syntax.md)
- [`doctrine/tool-types-have-clear-boundaries.md`](./doctrine/tool-types-have-clear-boundaries.md)
- [`doctrine/stage-forms-then-commit.md`](./doctrine/stage-forms-then-commit.md)
- [`doctrine/capabilities-over-click-targets.md`](./doctrine/capabilities-over-click-targets.md)
- [`stack/implementation-patterns.md`](./stack/implementation-patterns.md)

### Improve schemas, names, and descriptions

- [`doctrine/first-party-docs-define-runtime-syntax.md`](./doctrine/first-party-docs-define-runtime-syntax.md)
- [`doctrine/capabilities-over-click-targets.md`](./doctrine/capabilities-over-click-targets.md)
- [`doctrine/tool-descriptions-are-local-contracts.md`](./doctrine/tool-descriptions-are-local-contracts.md)

### Implement the house React or JavaScript blueprint

- [`stack/start-here.md`](./stack/start-here.md)
- [`stack/implementation-patterns.md`](./stack/implementation-patterns.md)
- [`stack/one-pass-instrumentation-plan.md`](./stack/one-pass-instrumentation-plan.md)
- [`doctrine/route-maps-drive-discovery.md`](./doctrine/route-maps-drive-discovery.md)
- [`doctrine/read-tools-live-at-data-boundaries.md`](./doctrine/read-tools-live-at-data-boundaries.md)
- [`doctrine/tool-types-have-clear-boundaries.md`](./doctrine/tool-types-have-clear-boundaries.md)

### Author prompt-driven guidance or reusable app workflows

- [`doctrine/user-stories-drive-web-skills.md`](./doctrine/user-stories-drive-web-skills.md)
- [`doctrine/route-maps-drive-discovery.md`](./doctrine/route-maps-drive-discovery.md)

## One-Shot Implementation Contract

Use this when the goal is: "instrument this existing app with WebMCP in one pass."

1. Read this file.
2. Read [`stack/one-pass-instrumentation-plan.md`](./stack/one-pass-instrumentation-plan.md).
3. Pull exact runtime syntax from the MCP-B docs server or first-party docs.
4. Map the app into route areas and user stories before registering feature tools.
5. Create the route layer first.
6. Add `WebMCP/` directories module by module.
7. Read [`stack/implementation-patterns.md`](./stack/implementation-patterns.md) before drafting wrappers.
8. Add read tools before navigation helpers and write tools.
9. Keep tool execute bodies thin and route all real logic through existing app functions.
10. Write web-skill workflow guidance after the tool surface exists.
11. Validate that the WebMCP surface mirrors the human product rather than bypassing it.

If the app is large, do not try to instrument every route at once. Start with the highest-value user story and make the pattern repeatable.

## Defaults

- Prefer WebMCP for making an existing human-facing product legible to agents.
- Prefer this skill for stable concepts and first-party docs for exact syntax.
- Prefer route-aware progressive disclosure over one giant tool surface.
- Prefer read tools near the data boundary that already shapes the UI.
- Prefer separating read, navigation, and mutation concerns even when one user story spans all three.
- Prefer staging form state before committing irreversible actions.
- Prefer fewer, more parameterized tools over one tool per button.
- Prefer thin WebMCP wrappers over new tool-only business logic.
- Prefer `WebMCP/` directories scoped by module over one global pile of tools.
- Prefer descriptions that explain the tool itself, not cross-tool choreography.
- Prefer user-story references that explain where to go and what to confirm, not brittle tool-name scripts.
- Prefer stable primitives and small examples over large copied API snapshots that may churn.
