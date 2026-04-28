---
example:
  primary: design-for-agent-accessibility
  format: text
  implements:
    - design-for-agent-accessibility
    - route-maps-drive-discovery
    - user-stories-drive-web-skills
---
# Design for Agent Accessibility

**Rule:** Use WebMCP to make the existing product legible and operable for agents. Do not use it to replace the product with an agent-only side channel.

See also: [Route Maps Drive Discovery](./route-maps-drive-discovery.md) and [User Stories Drive Web Skills](./user-stories-drive-web-skills.md).

## Why agents get this wrong

WebMCP is closest to accessibility infrastructure for agents. The human product remains primary. The agent gets a clearer, more structured way to discover and operate the same product the user already has.

This is usually best for existing apps that are hard for agents to drive through the DOM: SPAs, interaction-heavy flows, weak URL state, brittle click paths, or pages where the UI already depends on structured client state.

This file is the thesis doc for the skill. It explains what WebMCP is for. It does not define route shape, tool ordering, or workflow-writing conventions in detail.

## What to do instead

Keep the human UI primary. Expose the same features, constraints, and decision points a competent user already sees.

Do not use WebMCP as camouflage for a different product. If the real goal is an agent-native experience built around bespoke AI workflows, design that directly instead of pretending it is ordinary website instrumentation.

## Example

Bad:
- expose a hidden `book_cheapest_flight_now` path that skips the real product's search, review, and confirmation flow

Good:
- expose the same decision points and constraints a competent human user already works through in the product

Example implements: [Design for Agent Accessibility](./design-for-agent-accessibility.md), [Route Maps Drive Discovery](./route-maps-drive-discovery.md), [User Stories Drive Web Skills](./user-stories-drive-web-skills.md).
