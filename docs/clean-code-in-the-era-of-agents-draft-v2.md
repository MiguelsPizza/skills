# Clean Code in the Era of Agents

You will hear two things about coding agents that sound contradictory.

They write a lot of good code.

They also turn codebases into slop.

That stops sounding contradictory once you have watched an AI-heavy codebase for a few months.

The code usually looks fine in the diff. It compiles. The tests pass. The feature works. The problem is what happens after the third or fourth change, when you realize the system now has two or three local versions of the same idea, plus wrappers and adapters whose main job is to keep those versions alive.

That is what I mean by slop.

My favorite definition is still this one: slop is code that is locally reasonable and globally dishonest.

It looks fine in the file you are reading. It lies about where the real truth of the system lives.

I have been writing code with AI long enough to remember when "coding with AI" mostly meant copying a function out of ChatGPT and pasting it into your editor. Back then the model was a passenger. You still decided where code lived, which type owned a concept, whether a helper should exist, and what old code got deleted.

That is not how agentic coding feels now.

Now the model can change ten files, add a feature, fix the tests, and leave behind something that looks more organized than what was there before. That surface neatness is exactly why this goes wrong. People trust the result at the level of syntax and local structure long before they trust it at the level that actually matters: does the codebase still have one truthful version of each concept?

That is the real failure mode.

The problem is not just that agents refactor badly. The problem is that they constantly create parallel truths.

## Parallel truths are how slop starts

Agents re-declare types. They hand-write shapes that could have been inferred. They copy constants instead of importing them. They create a sibling helper rather than editing the existing owner. They preserve an old path while adding a new one beside it.

None of these look dramatic in isolation.

Together they make the codebase harder to reason about, harder to change, and easier for the next agent to misunderstand.

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

Then an agent adds a feature in another file:

```ts
type UserInfo = {
  id: string;
  email: string;
  role: "admin" | "member";
};

const USER_ROLES = ["admin", "member"] as const;
```

That looks harmless.

It is not harmless.

Now the same concept exists in four forms:

- the canonical schema
- the inferred `User` type
- a hand-written `UserInfo` type
- a second copy of the role values

At this point the code is still likely correct. It is also already starting to rot.

Later someone adds a `"guest"` role. They update `userRoleSchema`, but forget `UserInfo` and `USER_ROLES`. Type errors might catch some of that. Tests might catch some of that. But even if they do, you are now spending review and maintenance time on a problem that should not exist.

This is the part newer AI users often miss.

A lot of AI slop is not obviously broken code. It is code that created a second local source of truth, then a third, then made each future change slightly more annoying than it should have been.

Schemas drift like this too.

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

Now you have two validators for one concept. One trims `couponCode`; the other does not. One reuses `userIdSchema`; the other quietly weakens it to `z.string()`. One is probably where future people will look. The other is probably where the last agent happened to be standing.

That is what "globally dishonest" means in practice.

The system no longer tells you where the truth lives.

## Agents are biased toward adding siblings instead of editing owners

This is the other failure mode I see constantly.

There is already a real owner for behavior, but changing that owner would require touching callers or slightly reshaping the module. The agent avoids that and creates a new adjacent function instead.

Start here:

```ts
export async function getProductPrice(productId: string) {
  return await pricingApi.getPrice(productId, "USD");
}
```

Now the product needs currency support.

A straightforward change is:

```ts
export async function getProductPrice(
  productId: string,
  currency: Currency = "USD",
) {
  return await pricingApi.getPrice(productId, currency);
}
```

What agents often do instead is this:

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

Or this:

```ts
export async function getProductPrice(productId: string) {
  return await pricingApi.getPrice(productId, "USD");
}

export async function getLocalizedProductPrice(
  productId: string,
  currency: Currency,
) {
  return await getProductPriceWithCurrency(productId, currency);
}
```

That is not just a "bad refactor." It is a second truth about who owns price lookup.

Once the duplicate owner exists, more things collect around it:

- new callers pick different versions
- helpers appear to adapt one version to the other
- tests lock in both paths
- nobody wants to delete the old one because it might still matter

The file still looks professional. The system got worse.

This sibling-creation habit shows up everywhere:

- `UserInfo` instead of using `User`
- `checkoutRequestSchema` instead of reusing `createOrderInputSchema`
- `buildCheckoutContext` when the function could just accept the final shape
- `getProductPriceWithCurrency` instead of editing `getProductPrice`
- `saveUserV2` instead of changing `saveUser`

If you control the callers, the safest move is often the boring one: change the real owner and update the callers.

## Why this keeps happening

Part of it is context limits, but that is not the interesting part.

The more interesting part is that agents are rewarded for local success and local caution.

They are very good at:

- preserving the structure they can already see
- adding one more helper instead of deleting two
- introducing a wrapper because it feels safer than changing the original
- keeping old paths alive "just in case"
- copying the nearest example rather than asking whether it was the right example

That last one matters a lot.

Agents learn from local code the same way humans do, except they do it faster and with less skepticism. If one sloppy pattern lands in the repo, the next agent treats it like house style.

One hand-written duplicate type becomes the pattern for the next ten.

One pass-through wrapper becomes the expected way to call a library.

One compatibility shim becomes proof that old paths should always survive.

This is how codebases get weird without ever having a single obviously catastrophic diff.

They accumulate polite little lies.

## Why tests do not solve this

Testing matters. It is just not the center of this problem.

Tests are good at checking behavior from the outside. They are usually much worse at telling you that you now have two schemas for the same payload, three names for the same shape, or two functions competing to own one concept.

In fact, tests can make this problem worse if they freeze the extra structure in place.

If you have tests for both `getProductPrice` and `getProductPriceWithCurrency`, plus tests for the wrapper that adapts one to the other, the test suite may now be protecting the duplicate design instead of helping you remove it.

The right kind of test here is mostly boundary-oriented:

- does the endpoint still accept the same valid input?
- does the feature still produce the same observable result?
- does the real contract stay stable while internals get simpler?

That kind of test gives you room to delete junk.

The wrong kind of test attaches the codebase to helper choreography that never needed to exist.

## So what does "clean code" mean now?

For me, it mostly means four things.

First, every important concept gets one real owner.

One schema. One canonical type when a named type is needed. One source of constant values. One function that owns the behavior.

Second, internal code should not pretend to be a published library.

If you own all the callers, update them. Do not leave overloads, adapters, or compatibility paths around just to avoid touching the rest of the codebase.

Third, every layer has to earn its keep.

A helper that validates input, enforces an invariant, normalizes a vendor boundary, or guarantees cleanup may be worth it. A helper that just renames fields and forwards them is usually not architecture. It is drift.

Fourth, deletion is part of the job.

Agents are good at adding the new path. They are much worse at removing the corpse of the old one. Humans need to notice that and finish the cleanup.

## The review questions I keep coming back to

When I review AI-generated code now, I ask a few simple questions:

1. Where is the real source of truth for this concept?
2. Did this change create a second local version of that truth?
3. Did the agent edit the real owner, or did it create a sibling helper or wrapper?
4. What can be deleted right now?

Those questions catch a surprising amount of slop.

They also push on a deeper point.

The main job in AI-heavy codebases is not just making code pass today. It is stopping a fast code generator from slowly filling the repo with parallel truths, stale paths, and layers nobody asked for.

That is why AI code can look good locally and still become slop over time.

It is not always ugly. It is often tidy, typed, tested, and wrong about where reality lives.
