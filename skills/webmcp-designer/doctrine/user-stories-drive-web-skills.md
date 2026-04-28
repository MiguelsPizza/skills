---
example:
  primary: user-stories-drive-web-skills
  format: workflow
  implements:
    - user-stories-drive-web-skills
    - route-maps-drive-discovery
    - tool-descriptions-are-local-contracts
---
# User Stories Drive Web Skills

**Rule:** Organize WebMCP workflow guidance around user stories and routes, not around named tools.

See also: [Route Maps Drive Discovery](./route-maps-drive-discovery.md) and [Tool Descriptions Are Local Contracts](./tool-descriptions-are-local-contracts.md).

## Why agents get this wrong

Web skills are where you explain how the app works for real tasks. They should mirror user stories, not freeze one moment of the tool registry.

## What to do instead

Write each reference as one coherent user story:
- what the user is trying to achieve
- what information must be gathered first
- which route or app area to enter
- what to inspect before taking action
- where approval or confirmation belongs

Let the model pick the matching tools from descriptions and annotations at runtime. Routes and user goals change more slowly than tool names.

## Example

Flight booking story:
1. Gather origin, destination, dates, flexibility, and traveler constraints.
2. Move to the flight-search area.
3. Inspect available itineraries and compare options.
4. Clarify tradeoffs with the user.
5. Move to checkout only after the user has chosen.
6. Stage form state, review it, then commit.

Example implements: [User Stories Drive Web Skills](./user-stories-drive-web-skills.md), [Route Maps Drive Discovery](./route-maps-drive-discovery.md), [Tool Descriptions Are Local Contracts](./tool-descriptions-are-local-contracts.md).
