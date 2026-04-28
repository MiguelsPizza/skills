---
example:
  primary: read-tools-live-at-data-boundaries
  format: text
  implements:
    - read-tools-live-at-data-boundaries
    - capabilities-over-click-targets
    - tool-descriptions-are-local-contracts
---
# Read Tools Live at Data Boundaries

**Rule:** Register read-only tools where the UI-ready data shape enters the feature, not deep inside rendering code and not as raw API exhaust.

See also: [Capabilities Over Click Targets](capabilities-over-click-targets.md) and [Tool Descriptions Are Local Contracts](tool-descriptions-are-local-contracts.md).

## Why agents get this wrong

Good read tools sit at the point where the feature already knows what data matters for the user.

Too early means raw payloads full of metadata, flags, and transport noise. Too late means scraping rendered state that already lost structure.

## What to do instead

Attach read tools as close as possible to the layer that already shapes data for the user-facing feature. That is usually:
- after aggregation
- before presentation logic
- at the boundary where the feature's meaningful fields are known

If the user would not need a field to understand the screen, the model usually does not need it either.

## Example

Bad:
- expose the full JSON response from five endpoints, including observability fields and tombstone metadata

Good:
- expose one read tool that returns the same grouped, filtered flight options the feature already uses to render comparison cards

Example implements: [Read Tools Live at Data Boundaries](read-tools-live-at-data-boundaries.md), [Capabilities Over Click Targets](capabilities-over-click-targets.md), [Tool Descriptions Are Local Contracts](tool-descriptions-are-local-contracts.md).
