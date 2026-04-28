---
example:
  primary: first-party-docs-define-runtime-syntax
  format: code
  implements:
    - first-party-docs-define-runtime-syntax
    - design-for-agent-accessibility
    - tool-descriptions-are-local-contracts
---
# First-Party Docs Define Runtime Syntax

**Rule:** Use this skill for WebMCP design doctrine. Use the MCP-B docs server or first-party docs for exact syntax, package names, and annotations.

See also: [Design for Agent Accessibility](./design-for-agent-accessibility.md) and [Tool Descriptions Are Local Contracts](./tool-descriptions-are-local-contracts.md).

## Why agents get this wrong

WebMCP is still moving. The stable part is the design intent: route the agent, scope tools to context, separate reads from writes, and describe tools honestly.

The unstable part is exact API shape: package names, hook signatures, polyfill imports, annotation fields, and framework helpers. Pull those from first-party docs when you need them.

## What to do instead

Start every implementation or review by checking whether the user has the MCP-B docs server `docs.mcp-b.ai/mcp` connected.

If they do:
- inspect that server for the exact surface you need

If they do not:
- read `https://docs.mcp-b.ai/`
- treat those docs as the source of truth for exact code

Do not invent syntax from memory when the claim can be checked in the docs.

## Example

```typescript
// Stable concept from this skill:
// register a read tool near the feature's UI-shaped data boundary

// Exact import and registration syntax:
// pull from MCP-B docs or docs.mcp-b.ai before writing the final code
```

Example implements: [First-Party Docs Define Runtime Syntax](./first-party-docs-define-runtime-syntax.md), [Design for Agent Accessibility](./design-for-agent-accessibility.md), [Tool Descriptions Are Local Contracts](./tool-descriptions-are-local-contracts.md).
