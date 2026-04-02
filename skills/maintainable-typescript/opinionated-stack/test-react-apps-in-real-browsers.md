---
example:
  primary: test-react-apps-in-real-browsers
  format: code
  implements:
    - test-react-apps-in-real-browsers
    - integration-first-testing
    - stack-overview
references:
  authority:
    - title: Vitest Browser Mode
      url: https://vitest.dev/guide/browser/
    - title: Vitest Mocking Requests
      url: https://vitest.dev/guide/mocking/requests
    - title: Playwright Best Practices
      url: https://playwright.dev/docs/best-practices
    - title: Mock Service Worker
      url: https://mswjs.io/
  supporting: []
---
# Test React Apps in Real Browsers

**Rule:** For browser-facing React apps, run component and hook tests in Vitest Browser Mode with a Playwright provider, mock external HTTP boundaries with MSW, and use Playwright for user journeys. Do not default to jsdom.

See also: [Integration-First Testing](../references/integration-first-testing.md), [Opinionated Stack](stack-overview.md), and [Do Not Synchronize State with useEffect](do-not-synchronize-state-with-useeffect.md).

## Why agents get this wrong

Agents default to the cheapest test setup they know: jsdom, heavy internal mocks, and shallow assertions against implementation details.

That is the wrong trade for this stack. Browser apps depend on real browser semantics: focus, events, navigation, service workers, fetch behavior, layout timing, and runtime integrations. jsdom smooths over those edges, so the tests stay green while the product breaks in the browser.

Agents also confuse test lanes. They use Playwright for everything, which makes simple integration tests slow and expensive, or they use MSW everywhere, including end-to-end flows where the real backend boundary is the thing that should be under test.

## What to do instead

Use the right lane for the job:

1. Contract tests for schemas, serialization, and pure transforms.
2. Vitest Browser Mode for React components and hooks that depend on DOM or browser semantics.
3. MSW in browser-mode tests to mock external HTTP boundaries without mocking your own modules.
4. Playwright for cross-page, full-app, and critical user journeys.

For this stack, browser-mode tests are the default lane for frontend behavior. They should run in a real browser, not a simulated DOM.

MSW is a boundary mock, not a replacement backend. Use it when the network edge is outside the subject under test. If the backend integration itself is the subject, do not hide it behind MSW in the top E2E lane. Even in mocks, return canonical repo shapes: import shared schemas or types instead of inventing response objects inline.

Playwright is not a substitute for browser-mode tests. Use it for the flows that need a full page, real navigation, multiple routes, or end-to-end wiring.

## Example

Vitest config

```typescript
import { playwright } from "vite-plus/test/browser-playwright";
import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      headless: true,
    },
  },
});
```

Browser test harness

```typescript
import { afterEach, expect, test as testBase, vi } from "vitest";
import { setupWorker } from "msw/browser";

const worker = setupWorker();

export const test = testBase.extend<{ worker: typeof worker }>({
  worker: [
    async ({}, use) => {
      await worker.start({
        onUnhandledRequest: "error",
        serviceWorker: {
          url: "/mockServiceWorker.js",
          options: { scope: "/" },
        },
      });

      await use(worker);

      worker.resetHandlers();
      worker.stop();
    },
    { auto: true },
  ],
});

afterEach(() => {
  document.body.innerHTML = "";
});

export { expect, vi };
```

Browser integration test

```typescript
import { page } from "@vitest/browser";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { createRoot } from "react-dom/client";
import { UsersPage } from "@/features/users/components/users-page";
import { test, expect } from "@/test/browser-test";
import { usersResponseSchema, type User } from "@repo/shared-types/users/users";

test("renders users returned by the API in a real browser", async ({
  worker,
}) => {
  const users = [
    {
      id: "usr_123",
      name: "Ada Lovelace",
      archived_at: null,
    },
  ] satisfies readonly User[];

  worker.use(
    http.get("/api/users", () =>
      HttpResponse.json(usersResponseSchema.parse(users)),
    ),
  );

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const container = document.createElement("div");
  document.body.append(container);

  createRoot(container).render(
    <QueryClientProvider client={queryClient}>
      <UsersPage />
    </QueryClientProvider>,
  );

  await expect.element(
    page.getByRole("heading", { name: "Ada Lovelace" }),
  ).toBeInTheDocument();
});
```

Playwright end-to-end test

```typescript
import { expect, test } from "@playwright/test";

test("updates the URL and visible results when filtering users", async ({
  page,
}) => {
  await page.goto("/users?tab=all");

  await page.getByRole("textbox", { name: "Search users" }).fill("Ada");
  await page.getByRole("button", { name: "Active users" }).click();

  await expect(page).toHaveURL(/tab=active/);
  await expect(
    page.getByRole("heading", { name: "Ada Lovelace" }),
  ).toBeVisible();
});
```

Example implements: [Test React Apps in Real Browsers](test-react-apps-in-real-browsers.md), [Integration-First Testing](../references/integration-first-testing.md), [Opinionated Stack](stack-overview.md).

## The test

Before writing a frontend test, ask:

- Does this behavior depend on real browser semantics such as events, focus, navigation, service workers, or fetch behavior?
- If so, why is this not a browser-mode test?
- Am I mocking an external boundary, or am I mocking my own implementation?
- Does this flow need a full-page journey, or would a browser-mode test cover it faster?
- Am I using MSW only where the network boundary is outside the subject under test?

If the test is browser-facing and the answer still points to jsdom or internal mocks, the lane is probably wrong.
