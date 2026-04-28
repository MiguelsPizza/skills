---
example:
  primary: implementation-patterns
  format: code
  implements:
    - implementation-patterns
    - thin-wrappers-over-existing-logic
    - one-pass-instrumentation-plan
---
# Implementation Patterns

**Rule:** Use small, stable implementation sketches to shape the WebMCP layer, then confirm exact runtime syntax from the MCP-B docs server or first-party docs before writing final code.

See also: [Thin Wrappers Over Existing Logic](thin-wrappers-over-existing-logic.md) and [One-Pass Instrumentation Plan](one-pass-instrumentation-plan.md).

## Why agents get this wrong

Agents often overfit to one code sample and then cargo-cult unstable API details, helper names, or annotations across the whole app. The result is copied syntax that churns with the runtime instead of a durable wrapper shape.

## What to do instead

This file is not an API reference.

Use it to answer:
- what a good route tool looks like
- what a thin read wrapper looks like
- what staged write tools look like
- what a durable description looks like

For exact package names, registration calls, annotations, hooks, and polyfills, use the MCP-B docs server or `https://docs.mcp-b.ai/`.

## Registration surface

Prefer first-party WebMCP registration surfaces:
- `useWebMCP()` in React
- `registerTool()` when working directly against the browser registration surface

Do not teach the model to invent wrappers like `registerReadTool()` or `registerWriteTool()`. Those names look convenient, but they imply a helper layer that does not need to exist.

The examples below are intentionally incomplete. They show the stable parts:
- description shape
- handler shape
- boundary placement

They do not attempt to show the exact first-party API call signature.

## Example

### Route tool shape

```typescript
const routeToolDescription =
  'Move between major product areas and explain what each area is for.';

async function handleRouteSelection(input: { route: AppRoute }) {
  return appRouter.goTo(input.route);
}

// Register this with useWebMCP() or registerTool()
// using the exact first-party syntax from the docs server.
```

Good description:
- says this tool moves between major product areas
- says what input selects the destination
- does not explain the whole workflow around other tools

### Read tool shape

```typescript
// Existing feature logic
export async function listFlightOptions(filters: SearchFilters) {
  return flightsModel.listOptions(filters);
}

const readToolDescription =
  'Return the user-facing flight options for the current search filters.';

async function handleFlightOptionRead(input: FlightSearchInput) {
  return listFlightOptions(mapToolFilters(input));
}

// Register this handler with the first-party WebMCP surface.
```

Good pattern:
- wrapper maps tool input to existing feature input
- existing selector or service does the real work
- returned shape matches what the feature already uses

### Navigation tool shape

```typescript
const navigationToolDescription =
  'Move the current trip flow into checkout and preserve the selected itinerary.';

async function handleCheckoutNavigation() {
  return tripFlow.openCheckout();
}
```

Use navigation tools when the model needs to reveal more context, tabs, panes, or route-scoped tools.

### Staged write shape

```typescript
// Existing feature logic
export async function stageTravelerDetails(input: TravelerDraft) {
  return checkoutModel.stageTravelerDetails(input);
}

export async function submitBooking() {
  return checkoutModel.submit();
}

const prepareBookingDescription =
  'Stage traveler and payment details on the current booking form without submitting.';

async function handleBookingPreparation(input: BookingDraftInput) {
  return stageTravelerDetails(mapDraft(input));
}

const commitBookingDescription = 'Submit the currently prepared booking.';

async function handleBookingCommit() {
  return submitBooking();
}

// Register both handlers with useWebMCP() or registerTool()
// using the exact first-party syntax from the docs server.
```

Good pattern:
- one tool prepares visible state
- another tool commits
- both call existing feature logic

### Description shape

```typescript
const toolDescription = [
  'Prepare the current checkout form with traveler and payment inputs.',
  'Does not submit the booking.',
  'Returns validation errors when required fields are missing.',
].join(' ');
```

Good descriptions usually cover:
- what the tool does
- whether it changes visible state
- whether it commits an irreversible action
- what kind of result or validation signal comes back

Avoid descriptions like:
- "Use this after searchFlights and before bookFlight"
- "Call this with tool X unless tool Y is available"

### Wrapper boundary

```typescript
// Bad: tool-only business logic
async function handleTripUpgrade(input: UpgradeTripInput) {
  const eligibleSegments = input.segments.filter((segment) => segment.price > 200);
  const fee = eligibleSegments.length * 37;
  return api.post('/upgrade', { eligibleSegments, fee });
}

// Better: extract reusable app logic first
export async function upgradeTrip(input: UpgradeTripInput) {
  const eligibleSegments = selectEligibleUpgradeSegments(input);
  const fee = calculateUpgradeFee(eligibleSegments);
  return tripsApi.upgrade({ eligibleSegments, fee });
}

async function handleTripUpgrade(input: UpgradeTripInput) {
  return upgradeTrip(mapUpgradeInput(input));
}
```

If the wrapper starts inventing pricing, selection, or mutation rules, stop and move that logic back into the app.

Example implements: [Implementation Patterns](implementation-patterns.md), [Thin Wrappers Over Existing Logic](thin-wrappers-over-existing-logic.md), [One-Pass Instrumentation Plan](one-pass-instrumentation-plan.md).
