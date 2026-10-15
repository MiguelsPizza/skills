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

**Rule:** Test React frontend behavior in Vitest Browser Mode with Playwright, exercise real routes, and mock external HTTP with MSW. Use Playwright end-to-end tests for full user journeys.

See also: [Integration-First Testing](../doctrine/testing/integration-first-testing.md), [Opinionated Stack](./stack-overview.md), and [Do Not Synchronize State with useEffect](./do-not-synchronize-state-with-useeffect.md).

## Why agents get this wrong

Simulated DOMs and internal mocks can miss browser failures in focus, events, navigation, service workers, fetch, and layout timing. Full end-to-end tests add unnecessary cost when a smaller browser integration test covers the behavior.

## What to do instead

Choose the test scope by behavior:

1. Contract tests for schemas, serialization, and pure transforms.
2. Vitest Browser Mode with a Playwright provider for components, hooks, and routes that depend on browser behavior. This is the frontend default; do not default to jsdom.
3. MSW for HTTP boundaries outside the subject under test. Exercise your own modules and return fixtures validated by canonical shared schemas.
4. Playwright end-to-end tests for full-page navigation, cross-page flows, and critical user journeys.

For application regressions, mount the real route tree or a subtree that preserves production behavior. Do not replace it with a probe component that bypasses the route wiring.

When an end-to-end test covers backend integration, use the real backend boundary instead of MSW.

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
import { afterEach, test as testBase } from "vitest";
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

```

Browser integration test

```typescript
import { page } from "@vitest/browser";
import { expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { createRoot } from "react-dom/client";
import { UsersPage } from "@/features/users/components/users-page";
import { test } from "@/test/browser-test";
import type { User } from "@repo/contracts/users/user";
import { usersResponseSchema } from "@repo/contracts/users/list-users";

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

Example implements: [Test React Apps in Real Browsers](./test-react-apps-in-real-browsers.md), [Integration-First Testing](../doctrine/testing/integration-first-testing.md), [Opinionated Stack](./stack-overview.md).
