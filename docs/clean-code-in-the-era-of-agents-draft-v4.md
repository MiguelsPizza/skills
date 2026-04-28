# Clean Code in the Era of Agents

One thing that seems to confuse a lot of newer people about coding agents is that both of these statements are true at the same time: they often write decent code, and AI-heavy codebases still tend to get weird over time. If the code compiles and the diff looks reasonable, what exactly is everyone complaining about?

I think that question matters, because "AI slop" has turned into one of those phrases that everyone uses and almost nobody defines. The shortest version I have is that slop is code that seems reasonable when you read it locally, but is less honest about the system as a whole. That is a slightly coined way of putting it, but what I mean is ordinary enough. The file you are looking at seems fine, while the system around it is quietly getting less truthful. Duplicate concepts show up. Old paths never get removed. Wrappers survive long after they stopped earning their keep. Tests can accidentally make all of that harder to unwind.

That is why the whole thing feels confusing at first. Slop is not always obviously bad code. A lot of the time it is code that looks fine until you have to change it three more times.

I have been coding with these systems since back when "coding with AI" basically meant copying code out of ChatGPT and pasting it into your editor. In that phase, the model was mostly a passenger and you were still driving. You asked for a function, a regex, a React component, a SQL query, whatever, and then you decided where it went, how it fit, and whether it changed the shape of the system.

That mattered, because the human was still carrying the architectural memory. If tech debt accumulated, it was usually because the human let it accumulate.

Then the actual coding-agent era started. For me, the big shift was when tools started being able to one-shot much larger chunks of work. You stopped going file by file with the model and stopped micromanaging every function. The agent could make huge code changes very quickly, and a lot of the time they worked.

Usually the feature worked. If you skimmed the diff, it often looked pretty good. The names were decent, the types were usually not insane, and the modules were not obviously awful. So people started trusting the system at a much higher level of abstraction, and that is where the debt profile changed.

The problem is not that agents cannot write working code. The problem is that once they are making large changes semi-autonomously, they are very good at preserving the wrong things and very willing to create local truths of their own.

I think there are a few big reasons AI codebases start to feel rotten once they hit a certain level of complexity, but the biggest one is not actually "bad code" in the usual sense. It is that agents keep creating parallel truths.

## 1. Agents constantly create parallel truths

This is one of the biggest things they do wrong, and I still think it is under-discussed because it does not always look dramatic.

They re-declare types, hand-write shapes that could have been inferred, create a second schema instead of reusing the first one, copy constants instead of importing them, or invent a `UserInfo` or `CheckoutData` or `RequestState` type that is basically the same thing the codebase already had somewhere else.

A source of truth is just the place future changes are supposed to go. Once the codebase has two places that both look like the right place to update, the drift starts.

Here is a tiny example:

```ts
export const userRoleSchema = z.enum(["admin", "member"]);

export const userSchema = z.object({
  id: userIdSchema,
  email: z.string().email(),
  role: userRoleSchema,
});

export type User = z.infer<typeof userSchema>;
```

Then somewhere else the agent adds this:

```ts
type UserInfo = {
  id: string;
  email: string;
  role: "admin" | "member";
};

const USER_ROLES = ["admin", "member"] as const;

function toUserInfo(user: User): UserInfo {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
```

That is already enough to make the system worse, because the same concept now exists in more than one place. The next agent sees `UserInfo` and copies it. Someone adds tests around `toUserInfo`, so the duplicate structure starts to feel more legitimate than it really is. Then a `"guest"` role gets added, `userRoleSchema` gets updated, and `UserInfo` and `USER_ROLES` get missed. Nothing there is especially dramatic, but each later change now has more update sites, more patterns for the next agent to copy, and more chances for wrappers or adapters to appear once the shapes drift.

Schemas drift the same way. Suppose you already have this:

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

Now there are two validators for one concept. One trims `couponCode`; the other does not. One reuses `userIdSchema`; the other quietly weakens it to `z.string()`. One is probably where future people will look. The other is probably where the last agent happened to be standing. This is why I care so much about single sources of truth in AI codebases: when something can be derived, derive it; when a schema already exists, use it; when an existing function can support the new case, change that function instead of growing a sibling next to it.

## 2. Agents refactor in a way that feels clean but makes the code worse

This is the part I think most people mean when they say an AI codebase feels weird.

The agent goes back to "clean up" the code, but instead of really changing the design, it preserves the existing logic and wraps it.

It will rename the same data three times, introduce one more helper that slightly reshapes an object, create a new function instead of changing the existing one, and build a "nicer" version of the old thing instead of fixing the old thing itself. It almost always prefers creating adjacent structure over editing the original structure into the right shape.

Here is a version of that pattern that I see all the time.

Suppose you start with this:

```ts
export async function createOrder(input: CreateOrderInput) {
  return await ordersApi.create(input);
}
```

Now the feature changes a little. Maybe checkout needs a coupon code, and `CreateOrderInput` gets updated to include it.

A human who understands the system will often just keep the owner the owner. The caller passes the updated shape to `createOrder`, and that is the whole change:

```ts
const input: CreateOrderInput = {
  userId,
  couponCode,
  items,
};

return await createOrder(input);
```

What agents often do instead is something like this:

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

Then a little later it turns into this:

```ts
export async function startCheckout(input: CheckoutRequest) {
  return await createOrderWithCoupon(input);
}
```

Read line by line, none of that looks disastrous. It even looks cleaner in a narrow sense, but the code got worse. The feature now has several names for almost the same shape, more than one plausible place for a future change to land, and extra code whose main job is preserving the previous refactor. `createOrderWithCoupon` did not introduce a new invariant. `startCheckout` did not establish a real boundary. They mostly renamed the path through the code.

Another version is when the model refuses to edit an existing function into the new correct shape and instead creates a second function beside it.

Say you start with this:

```ts
export async function getProductPrice(productId: string) {
  return await pricingApi.getPrice(productId, "USD");
}
```

Now you want currency support. A human who understands the system might just change the function:

```ts
export async function getProductPrice(
  productId: string,
  currency: Currency = "USD",
) {
  return await pricingApi.getPrice(productId, currency);
}
```

What agents often do instead is something like this:

```ts
export async function getProductPrice(productId: string) {
  return await pricingApi.getPrice(productId, "USD");
}

export async function getProductPriceWithCurrency(
  productId: string,
  currency: Currency,
) {
  return await pricingApi.getPrice(productId, currency);
}
```

This is the thing I keep seeing. The model creates new code instead of changing the owner that already existed. By "editing existing," I do not mean wrapping the old thing in a new thing. I mean literally changing the existing function so the system has one place that actually owns the behavior. Instead, agents tend to preserve callers, preserve old structure, and add siblings or wrappers that can live beside the original. That is why a lot of AI refactors feel off even when the diff itself looks tidy.

## 3. Your tests can still pass while the system gets worse

Testing matters, but I do not think testing is the center of this problem.

Tests are good at telling you whether behavior still works from the outside. They are much worse at telling you that the codebase now has duplicate schemas for the same payload, multiple names for the same shape, or two functions competing to own one concept.

You can easily end up with a test like this:

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

That test can pass while the route validates with `checkoutRequestSchema`, the core function expects `CreateOrderInput`, and a wrapper converts one shape into the other. In fact, tests can make this worse if they start protecting the duplicate structure. If you have tests for both the old path and the new wrapper path, the suite may now be freezing in place a design that should have been consolidated. The useful tests here are mostly boundary-oriented: keep the observable behavior stable, keep the contract stable, then simplify the internals and delete the junk. What tests usually will not tell you is where the real owner should live.

## 4. The real review job is not "does this work?"

The reason this matters so much in AI-heavy codebases is that bad patterns propagate unusually fast.

Agents learn from local code the same way humans do, except they do it faster and with less skepticism. One duplicate type can become an example. One pass-through wrapper can start to look like the normal shape of the system. One compatibility path that should have been removed can make it seem like old paths are supposed to stay around forever.

That is why one sloppy local decision can turn into a repo-wide style much faster than it used to.

So when I review AI-generated diffs now, I am usually looking for the same kinds of mistakes: a duplicate type that did not need to exist, a second schema for the same payload, a sibling helper where the real owner should have been edited, or an old path that should have been deleted but got preserved instead. Those are the changes that make a codebase feel worse without necessarily making any single diff look bad.

I do not think the old advice about maintainability was wrong. I think the pressure changed. We can generate code much faster now, which means duplicated structure, stale wrappers, and fake abstractions spread much faster too. At this point a lot of the work is just refusing to let a fast code generator fill the repo with second versions of things you already had.
