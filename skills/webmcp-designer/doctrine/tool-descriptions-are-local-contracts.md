---
example:
  primary: tool-descriptions-are-local-contracts
  format: text
  implements:
    - tool-descriptions-are-local-contracts
    - capabilities-over-click-targets
    - user-stories-drive-web-skills
---
# Tool Descriptions Are Local Contracts

**Rule:** Tool descriptions should explain what the tool does, what its inputs mean, and what state it affects. They should not hardcode the whole workflow around other tools.

See also: [Capabilities Over Click Targets](./capabilities-over-click-targets.md) and [User Stories Drive Web Skills](./user-stories-drive-web-skills.md).

## Why agents get this wrong

Tool descriptions are local contracts. They should say what the tool does, what the important fields mean, and what kind of state change to expect.

Workflow guidance belongs somewhere else: route maps, skill references, and user-story docs. That keeps descriptions durable when tools get renamed, split, or combined.

## What to do instead

Keep tool descriptions local.

Describe:
- what the tool does
- what the key fields mean
- what kind of side effect to expect

Put multi-step workflow guidance in route maps, prompts, or skill references where the behavior can evolve without renaming the whole tool surface.

## Example

Bad description:
- "Use this after `searchFlights`, before `bookFlight`, unless `changeTripTab` is available."

Good description:
- "Prepare the current checkout form with traveler and payment inputs. Does not submit the booking."

Example implements: [Tool Descriptions Are Local Contracts](./tool-descriptions-are-local-contracts.md), [Capabilities Over Click Targets](./capabilities-over-click-targets.md), [User Stories Drive Web Skills](./user-stories-drive-web-skills.md).
