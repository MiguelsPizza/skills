---
example:
  primary: route-maps-drive-discovery
  format: workflow
  implements:
    - route-maps-drive-discovery
    - design-for-agent-accessibility
    - user-stories-drive-web-skills
---
# Route Maps Drive Discovery

**Rule:** Give the agent a durable route map before you hand it feature tools.

See also: [Design for Agent Accessibility](design-for-agent-accessibility.md) and [User Stories Drive Web Skills](user-stories-drive-web-skills.md).

## Why agents get this wrong

The route layer is the website's system prompt. It tells the model what parts of the product exist, what user story each area supports, and how to move between them without losing its place.

SPAs need this most because important state often lives outside the URL.

## What to do instead

Expose a top-level navigation tool or equivalent route surface that stays available across the app. Treat it like the website's system prompt.

The route tool should answer:
- what routes or app areas exist
- what user story each area supports
- what state is preserved when moving there

It should not dump every implementation detail. Its job is orientation.

## Example

Good flow:
1. Read the route map.
2. Move to the flight search area.
3. Discover search and comparison tools scoped to that area.
4. Move to checkout only when the user has chosen an option.

Bad flow:
1. Start on the dashboard.
2. Call a checkout mutation because its name looked relevant.

Example implements: [Route Maps Drive Discovery](route-maps-drive-discovery.md), [Design for Agent Accessibility](design-for-agent-accessibility.md), [User Stories Drive Web Skills](user-stories-drive-web-skills.md).
