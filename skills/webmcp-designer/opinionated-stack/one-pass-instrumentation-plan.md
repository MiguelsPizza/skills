---
example:
  primary: one-pass-instrumentation-plan
  format: workflow
  implements:
    - one-pass-instrumentation-plan
    - start-here
    - thin-wrappers-over-existing-logic
---
# One-Pass Instrumentation Plan

**Rule:** When asked to add WebMCP to an existing app in one shot, work in a fixed order: confirm runtime syntax, map routes, add route tools, wrap feature modules, then write user-story guidance.

See also: [Start Here](start-here.md), [Thin Wrappers Over Existing Logic](thin-wrappers-over-existing-logic.md), and [Implementation Patterns](implementation-patterns.md).

## Why agents get this wrong

Agents often instrument the first obvious screen, register a few mutations, and call the app "WebMCP-enabled." That produces a pile of local tools without a route story, without clear read-versus-write sequencing, and without a repeatable module pattern.

This file exists for the cases where ad hoc local changes are not enough and the work needs one coherent execution order.

## What to do instead

Use this file when the user wants a coherent implementation pass, not a narrow answer about one tool or one route.

This is the file that turns the doctrine into an execution plan.

## Read this order

1. Read [SKILL.md](../SKILL.md).
2. Read this file.
3. Pull exact runtime syntax from the MCP-B docs server `docs.mcp-b.ai/mcp` if available.
4. If that server is unavailable, read `https://docs.mcp-b.ai/`.
5. Read the smallest additional doctrine set needed for the target app:
   - route shape: [Route Maps Drive Discovery](../references/route-maps-drive-discovery.md)
   - read tools: [Read Tools Live at Data Boundaries](../references/read-tools-live-at-data-boundaries.md)
   - tool separation: [Tool Types Have Clear Boundaries](../references/tool-types-have-clear-boundaries.md)
   - forms and commits: [Stage Forms, Then Commit](../references/stage-forms-then-commit.md)
   - tool shape: [Capabilities Over Click Targets](../references/capabilities-over-click-targets.md)
   - workflow writing: [User Stories Drive Web Skills](../references/user-stories-drive-web-skills.md)
6. Read [Implementation Patterns](implementation-patterns.md) before writing any wrappers.

## Execution order

1. Identify the top user stories the app already supports.
2. Map those user stories to durable route areas or SPA contexts.
3. Add the top-level route tool at the app shell.
4. For the highest-value route, create a module-local `WebMCP/` directory.
5. Add read tools at the module's UI-shaped data boundary.
6. Add navigation tools if tabs, panes, or sub-routes are needed to reveal more context.
7. Add write tools only after the read path is clear.
8. Split staged form preparation from final commit for risky actions.
9. Write web-skill guidance around the user story and route flow.
10. Repeat for the next route.

## What not to do

- Do not start by registering mutation tools on the first screen you find.
- Do not mirror every button as a separate tool.
- Do not create a global `webmcp/` junk drawer detached from feature modules.
- Do not put domain logic in execute bodies that the rest of the app does not share.
- Do not write web-skill references that hardcode current tool names.

## Example

For a site like `delta.com`, the first coherent slice is not "instrument everything."

It is:
1. route tool for major travel flows
2. flight search read tools
3. comparison and sub-navigation tools
4. checkout preparation tools
5. checkout commit tools
6. one booking user-story skill

That slice gives the agent a complete story it can actually follow.

## Operator prompt

Use this prompt shape inside the implementation task:

```text
Instrument this existing app with WebMCP using the webmcp-designer skill.

First, pull exact syntax and runtime details from the MCP-B docs server if available, otherwise from docs.mcp-b.ai.

Then follow the skill in this order:
1. Read SKILL.md.
2. Read opinionated-stack/one-pass-instrumentation-plan.md.
3. Add the top-level route tool.
4. Implement module-local WebMCP wrappers in WebMCP/ directories.
5. Add read tools before write tools.
6. Keep execute bodies thin and route behavior through existing app logic.
7. Use implementation-patterns.md for wrapper shape and description shape.
8. Write workflow guidance as user stories, not tool-name scripts.

Do not invent tool-only business logic. Do not bypass the human product flow.
```

The prompt is not the source of truth. The skill files are. The prompt only forces the reading order and execution order.

Example implements: [One-Pass Instrumentation Plan](one-pass-instrumentation-plan.md), [Start Here](start-here.md), [Thin Wrappers Over Existing Logic](thin-wrappers-over-existing-logic.md).
