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

**Rule:** Do not use `useEffect` to synchronize application state. Router owns route state, Query owns server state, render computes derived state, and low-level adapters own external synchronization.

See also: [Opinionated Stack](./stack-overview.md) and [Do Not Use Next.js](./do-not-use-nextjs.md).

## Why agents get this wrong

Effects that copy router state, query results, or derived lists into component state create competing owners and extra renders. Lifting that state to the app shell spreads those renders across unrelated features.

## What to do instead

Assign each value to its owner:

1. Put navigable and shareable UI state in TanStack Router search params.
2. Put server state in TanStack Query.
3. Derive filtered, sorted, or decorated values during render.
4. Use `useState` for local, transient UI state that does not belong in the URL.
5. Isolate external synchronization in a provider or adapter hook near the subtree that needs it.

Feature components must not use effects to copy state between React containers. Before adding an exception, fix any ownership problem that could remove the effect. Put an effectful provider at the app root only when the whole app depends on the external system.

## Example
```typescript
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UsersPageScreen } from "@/features/users/components/users-page-screen";
import { useORPC } from "@/utils/orpc";
import { usersSearchSchema } from "@repo/contracts/users/users-search";

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
import { userTabValues } from "@repo/contracts/users/users-search";
import type { User } from "@repo/contracts/users/user";

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

Example implements: [Do Not Synchronize State with useEffect](./do-not-synchronize-state-with-useeffect.md), [Opinionated Stack](./stack-overview.md), [Do Not Use Next.js](./do-not-use-nextjs.md).
