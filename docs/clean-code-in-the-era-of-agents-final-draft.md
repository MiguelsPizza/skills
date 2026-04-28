# Clean Code in the Era of Agents

You will hear two things about coding agents that sound contradictory.

They write a lot of good code.

They also turn codebases into slop.

That stops sounding contradictory once you have watched an AI-heavy codebase for a while.

The diff looks fine. It compiles. The tests pass. The feature works. Then the fourth change comes along and you realize the system now has multiple local versions of the same idea, plus wrappers and adapters whose main job is to keep those versions alive.

My favorite definition is still this one: slop is code that is locally reasonable and globally dishonest.

It looks fine in the file you are reading. It lies about where the real truth of the system lives.

The problem is not usually that the code is obviously terrible. The problem is that it quietly creates parallel truths.

## Parallel truths are how slop starts

Agents re-declare types. They hand-write shapes that could have been inferred. They copy constants instead of importing them. They create a sibling helper instead of editing the existing owner. They preserve an old path while adding a new one beside it.

A source of truth is just the place future changes are supposed to go.

Once the codebase has more than one of those places for the same concept, the drift starts.

Start with something clean:

```ts
export const userRoleSchema = z.enum(["admin", "member"]);

export const userSchema = z.object({
  id: userIdSchema,
  email: z.string().email(),
  role: userRoleSchema,
});

export type User = z.infer<typeof userSchema>;
```

Then an agent lands a feature in another file:

```ts
type UserInfo = {
  id: string;
  email: string;
  role: "admin" | "member";
};

const USER_ROLES = ["admin", "member"] as const;

function formatUserInfo(user: User): UserInfo {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
```

Now the same concept exists in four forms:

- the canonical schema
- the inferred `User` type
- a hand-written `UserInfo` type
- a second copy of the role values

At this point the code still probably works.

Then time passes.

Another agent needs a display model, finds `UserInfo`, and builds on that instead of `User`.

Another one adds tests around `formatUserInfo`, so now the duplicate shape has its own protection.

Then someone adds a `"guest"` role and updates `userRoleSchema` but forgets `UserInfo` and `USER_ROLES`.

Now the role change has two obvious update sites and one fake helper orbiting them. One of those sites is easier to miss because it looks like harmless UI glue.

Nothing about this story is dramatic. That is exactly why it is common.

This is what a lot of AI slop looks like. Not one catastrophic change. Just a system slowly gaining second and third copies of things it already knew.

Schemas drift the same way.

Suppose you already have this:

```ts
export const createOrderInputSchema = z.object({
  userId: userIdSchema,
  couponCode: z.string().trim().min(1).optional(),
  items: z.array(orderItemSchema).min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
```

Then a route handler adds its own version:

```ts
const checkoutRequestSchema = z.object({
  userId: z.string(),
  couponCode: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
    }),
  ),
});
```

Again, the code may work.

But now a future change has two validation sites, and the weaker one is likely to be the one someone edits first.

## The next step is usually sibling owners

Once agents start creating parallel truths, the next thing they do is create adjacent owners for behavior.

There is already a function that owns the work. Changing it would require touching callers or reshaping the module a little. The agent avoids that and adds a new function beside it.

Start here:

```ts
export async function createOrder(input: CreateOrderInput) {
  return await ordersApi.create(input);
}
```

Now the feature needs coupon-aware checkout.

The clean version is not a new function. It is callers passing the updated shape to the same owner:

```ts
const input: CreateOrderInput = {
  userId,
  couponCode,
  items,
};

return await createOrder(input);
```

What I keep seeing from agents is more like this:

```ts
export async function createOrder(input: CreateOrderInput) {
  return await ordersApi.create(input);
}

export async function createOrderWithCoupon(input: {
  userId: string;
  couponCode?: string;
  items: Array<{ productId: string; quantity: number }>;
}) {
  return await createOrder({
    userId: input.userId,
    couponCode: input.couponCode,
    items: input.items,
  });
}
```

Then a little later:

```ts
export async function startCheckout(input: CheckoutRequest) {
  return await createOrderWithCoupon(input);
}
```

None of these functions enforces a new invariant or owns a real boundary. They mostly rename the path through the code.

Now there are more names, more shapes, and more places a future change might land first.

That is the pattern I mean when I say agents create new code instead of editing the real owner.

## Why this keeps happening

Part of it is context limits, but that is not the interesting part.

The more interesting part is that agents are rewarded for local success and local caution.

They are very good at:

- preserving the structure they can already see
- adding one more helper instead of deleting two
- introducing a wrapper because it feels safer than changing the original
- keeping old paths alive "just in case"
- copying the nearest example rather than asking whether it was a good one

That last one matters a lot.

Agents learn from local code the same way humans do, except they do it faster and with less skepticism. One duplicate type or pass-through wrapper does not stay isolated for long. It becomes the example the next agent copies.

This is how codebases get weird without ever having a single catastrophic diff.

## Why tests do not solve this

Testing matters. It is just not the center of this problem.

Tests are good at checking behavior from the outside. They are usually much worse at telling you that you now have two schemas for the same payload, three names for the same shape, or two functions competing to own one concept.

You can have this:

```ts
it("creates an order with a coupon", async () => {
  const response = await request(app)
    .post("/orders")
    .send({
      userId: "user_123",
      couponCode: "SAVE10",
      items: [{ productId: "prod_1", quantity: 1 }],
    });

  expect(response.status).toBe(201);
});
```

That test can pass while the route validates with `checkoutRequestSchema`, the core function expects `CreateOrderInput`, and a wrapper converts one shape into the other.

The product behavior is still correct. The system is still drifting.

The right tests here are mostly boundary tests that keep behavior stable while you simplify internals. They give you room to delete junk. They do not tell you which file should own the concept.

## What I actually look for in AI code now

When I review AI-generated code, I mostly ask four questions:

1. Where is the real source of truth for this concept?
2. Did this change create a second local version of that truth?
3. Did the agent edit the real owner, or did it create a sibling helper or wrapper?
4. What can be deleted right now?

That is a pretty boring checklist.

It also catches most of the slop I care about.

AI makes it cheap to add code. The review job is to stop it from adding second versions of concepts the codebase already had.
