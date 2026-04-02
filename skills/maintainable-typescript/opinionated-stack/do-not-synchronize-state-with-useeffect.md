---
example:
  primary: do-not-synchronize-state-with-useeffect
  format: code
  implements:
    - do-not-synchronize-state-with-useeffect
    - stack-overview
    - do-not-use-nextjs
references:
  authority:
    - title: React `useEffect`
      url: https://react.dev/reference/react/useEffect
    - title: React `You Might Not Need an Effect`
      url: https://react.dev/learn/you-might-not-need-an-effect
    - title: React `Synchronizing with Effects`
      url: https://react.dev/learn/synchronizing-with-effects
    - title: TanStack Router Type Safety
      url: https://tanstack.com/router/latest/docs/guide/type-safety
    - title: TanStack Router `getRouteApi`
      url: https://tanstack.com/router/latest/docs/api/router/getRouteApiFunction
    - title: TanStack Router Search Params
      url: https://tanstack.com/router/latest/docs/guide/search-params
    - title: TanStack Query TypeScript
      url: https://tanstack.com/query/latest/docs/framework/react/typescript
    - title: TanStack Query Query Options
      url: https://tanstack.com/query/latest/docs/framework/react/guides/query-options
  supporting: []
---
# Do Not Synchronize State with useEffect

**Rule:** In this stack, do not use `useEffect` to synchronize application state. Route state belongs to TanStack Router, server state belongs to TanStack Query, derived state belongs in render, and external synchronization belongs in a low-level provider or adapter.

See also: [Opinionated Stack](stack-overview.md) and [Do Not Use Next.js](do-not-use-nextjs.md).

## Why agents get this wrong

Agents treat `useEffect` as the generic place for "stuff that should happen after render." That leads them to fetch in effects, copy router state into component state, mirror query results into local arrays, and keep tabs, filters, pagination, and modal state outside the route.

That pattern breaks the ownership model the stack is built around. It hides state in multiple places, causes avoidable rerenders, makes back/forward navigation worse, and teaches the next agent to keep synchronizing one React state container to another.

Agents also tend to lift this synchronized state too high in the tree. Then every downstream subtree rerenders because a tab, filter, or derived list was placed near the app shell instead of near the feature that actually needs it.

## What to do instead

Use the owner that already exists:

1. Put navigable and shareable UI state in TanStack Router search params.
2. Put server state in TanStack Query.
3. Derive filtered, sorted, or decorated values during render.
4. Use local `useState` only for truly local transient UI state that does not belong in the URL.
5. If you must synchronize with an external system, isolate that `useEffect` in a dedicated provider or adapter hook as low in the tree as practical.

For normal feature components, `useEffect` is effectively banned. React's own docs define effects as synchronization with external systems. If there is no external system, there should usually be no effect.

There are narrow exceptions, but if you feel you need one, there is almost always an existing structural issue. Try to fix that first. Even then, keep the effect near the subtree that needs it. Do not place effectful providers at the top of the app unless the whole app truly depends on that external system.

## Example
```typescript
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UsersPageScreen } from "@/features/users/components/users-page-screen";
import { useORPC } from "@/utils/orpc";
import { usersSearchSchema } from "@repo/shared-types/users/users-search";

export const Route = createFileRoute("/users")({
  validateSearch: usersSearchSchema,
  component: UsersPage,
});

function UsersPage() {
  const { tab, query } = Route.useSearch();
  const orpc = useORPC();

  const { data: users = [] } = useQuery(orpc.users.list.queryOptions());

  const visibleUsers = users.filter((user) => {
    if (tab === "active" && user.archived_at !== null) {
      return false;
    }

    if (query === "") {
      return true;
    }

    return user.name.toLowerCase().includes(query.toLowerCase());
  });

  return <UsersPageScreen users={visibleUsers} />;
}
```

Feature component

```typescript
import { getRouteApi } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userTabValues } from "@repo/shared-types/users/users-search";
import type { User } from "@repo/shared-types/users/user";

const usersRouteApi = getRouteApi("/users");

interface UsersPageScreenProps {
  readonly users: readonly User[];
}

function getUserTabLabel(tab: (typeof userTabValues)[number]) {
  return tab === "all" ? "All users" : "Active users";
}

export function UsersPageScreen({ users }: UsersPageScreenProps) {
  const { tab, query } = usersRouteApi.useSearch();
  const navigate = usersRouteApi.useNavigate();

  return (
    <section className="space-y-4">
      <Input
        value={query}
        onChange={(event) =>
          navigate({
            replace: true,
            search: (prev) => ({
              ...prev,
              query: event.target.value || undefined,
            }),
          })
        }
      />

      <div className="flex gap-2">
        {userTabValues.map((userTab) => (
          <Button
            key={userTab}
            type="button"
            variant={tab === userTab ? "default" : "ghost"}
            onClick={() =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  tab: userTab,
                }),
              })
            }
          >
            {getUserTabLabel(userTab)}
          </Button>
        ))}
      </div>

      <UsersTable users={users} />
    </section>
  );
}
```

Example implements: [Do Not Synchronize State with useEffect](do-not-synchronize-state-with-useeffect.md), [Opinionated Stack](stack-overview.md), [Do Not Use Next.js](do-not-use-nextjs.md).

## The test

Before shipping any `useEffect`, ask:

- Is this effect only synchronizing one React state container to another?
- Should this state live in the route instead?
- Should this data come from TanStack Query instead?
- Can this value be derived in render instead of stored?
- If this effect is truly necessary, why is it not isolated to a provider or adapter near the subtree that needs it?

If those questions point back to Router, Query, or render-time derivation, delete the effect.
