# Clean Code in the Era of Agents

You will hear two things about coding agents that sound contradictory at first.

The first is that they write good code. The second is that AI codebases fall apart.

A lot of vibe coders in the space get stuck on that. They will ask some version of: if the code is good, why does everyone complain about slop? If the code works, what exactly makes it slop? Then you have takes like "Engineers are just mad that AI can write better code than them". I actually don't disagree that AI is better in some ways than humans. AI's can one shot features in half an hour that would have taken a dev team a week. But Humans have long term memory and are usually aware of the tech debt hotspots of a codebase they wrote. AI's are like contractors that come in, huck slop, then leave. The none knows where the techdebt is becuase knowone remebers why certain thigns were written. The AI session forgets after it's compaction section etc.

I think that question matters, because “AI slop” has turned into one of those phrases that everyone uses and almost nobody defines.

When I think about slop, I like to think about the equivlent thing pre-ai. My first job at Amazon was mainating a 20YOE rails applcation with 2+ million lines of code. My manager was spinning up a new team and was just learning it, no one who wrote it was still at the company and figuring out what it did, who was using it and why certain descions where man was a pure partice in archiology. Everytime we tocuhed somethign it broke, it had a test suite that was not part of CI and had not worked in 10 years and after a few months of working on it, we realized that 1 millions lines of it were purelyy unconnected and dead and that an entire new team acrross the company had been spun up, re-writteen it from scratch in java and moved all the users there. No one had any idea.

That is worse case sceario of human tech debt, but it happend becuase of people curn and never priortized tech debt. This has alwasy been an issue, but now a small team can write 2million lines of code with agents in a matter of weeks, an just like the rails codebase, if the humans loose site of the file by file meaning of the code, no one does. becyase the agents are employees that only exist for a moment, and you can't contact them after they are gone. That is AI slop. Tech debt created at the speed of light.

A lot of slop works just fine. It type-checks, the names are usually decent, and if you read it line by line it may not even look that bad. The problem is that it no longer represents the system truthfully. It has extra layers, duplicate concepts, stale wrappers, fake abstractions, preserved historical paths, and tests that lock all of that in place.

That is why the whole thing feels confusing at first. Slop is not always obviously bad code. A lot of the time it is code that looks fine until you have to change it three more times.

I have been coding with these systems since back when “coding with AI” basically meant copying code out of ChatGPT and pasting it into your editor. In that phase, the model was mostly a passenger and you were still driving. You asked for a function, a regex, a React component, a SQL query, whatever, and then you decided where it went, how it fit, and whether it changed the shape of the system.

That mattered, because the human was still carrying the architectural memory. If tech debt accumulated, it was usually because the human let it accumulate.

Then the actual coding-agent era started. For me, the big shift was when tools like Claude Code started being able to one-shot much larger chunks of work. You stopped going file by file with the model and stopped micromanaging every function. The agent could make huge code changes very quickly, and a lot of the time they worked.

That is exactly why trust increased.

The code compiled, the tests passed, and the feature worked. Even if you skimmed the diff, the code often looked pretty good. The names were decent, the types were usually not insane, and the modules were not obviously awful. So people started trusting the system at a much higher level of abstraction.

That is where the debt profile changed.

The problem is not that agents cannot write working code. The problem is that once they are making large changes semi-autonomously, they are very good at preserving the wrong things.

I think there are a few big reasons AI codebases start to feel rotten once they hit a certain level of complexity.

## 1. The model can only hold so much of the codebase in its head

This one is the most obvious, and also the least interesting, but it is still real.

Every agent has some limited view of the system. That does not just mean the raw context window. It also means what parts of the repo it chose to inspect, what conventions it noticed, what examples it anchored on, and what tradeoffs it made between “understand the feature” and “understand the architecture.”

That creates a real tradeoff. If you give the model a ton of architectural context, patterns, standards, and doctrine, you eat into the budget it could have used to understand the actual problem. If you give it only the problem-specific context, it can finish the feature, but it will often regress the codebase.

That part is not new. Humans also do implementation first and cleanup second.

The difference is that agents can generate so much code so quickly that the cleanup pass matters a lot more. If you skip it, the volume alone starts to bury you.

I do not think this is the most dangerous failure mode, though. A rough first pass because the model had incomplete context is normal.

The more dangerous thing starts once the model begins creating local truths of its own and then “cleaning up” around them.

## 2. Agents constantly create parallel truths

This is one of the biggest things they do wrong, and I think it is under-discussed because it does not always look dramatic.

They re-declare types. They hand-write shapes that could have been inferred. They create a second schema instead of reusing the first one. They write inline object shapes where the codebase already had a canonical named type. They copy constants instead of importing them. They create a `UserInfo` or `CheckoutData` or `RequestState` type that is basically the same thing the codebase already had somewhere else.

Here is a tiny example:

```ts
export const userSchema = z.object({
  id: userIdSchema,
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
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

function toUserInfo(user: User): UserInfo {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
```

That kind of thing is slop too. The code still works. The type still looks reasonable. But now the same concept exists in more than one place.

And the inline-shape version is not much better. If another function takes `{ id: string; email: string; role: "admin" | "member" }` instead of `User`, that still creates a fake local owner. The fields match, but the concept lost its name and its home.

Once that starts happening, everything gets worse. Changes have more update sites. Agents have more patterns to copy. Wrappers appear because the shapes drifted. Adapters appear because there are now multiple local versions of the same idea. The codebase becomes mechanically type-safe and conceptually fragile at the same time.

This is why I care so much about a single source of truth. If the type can be derived, derive it. If the schema already exists, use it. If the codebase already has a canonical named type, import that instead of writing an inline substitute. If the constant already exists, import it. If the existing function can be extended to support the new case, edit it instead of creating a sibling.

Agents do the same thing at the module boundary too. They leave forwarding imports and re-exports around so a symbol appears to live in two places. That is just parallel truth in path form.

## 3. Agents refactor in a way that feels clean but makes the code worse

This is the part I think most people mean when they say an AI codebase feels weird.

The agent goes back to “clean up” the code, but instead of really changing the design, it preserves the existing logic and wraps it.

It will rename the same data three times, introduce one more helper that slightly reshapes an object, create a new function instead of changing the existing one, and build a “nicer” version of the old thing instead of fixing the old thing itself. It almost always prefers creating adjacent structure over editing the original structure into the right shape.

Here is a tiny version of that pattern.

Suppose the feature starts with a normal parent flow:

```ts
export async function postCheckout(req: Request) {
  const cart = await carts.getActiveCart(req.userId);

  const session = await stripe.checkout.sessions.create({
    customer: cart.userId,
    cartId: cart.id,
  });

  return redirect(session.url);
}
```

Then the requirements change. Maybe now there is an optional coupon code. A human would usually update the existing call directly:

```ts
export async function postCheckout(req: Request) {
  const cart = await carts.getActiveCart(req.userId);

  const session = await stripe.checkout.sessions.create({
    customer: cart.userId,
    cartId: cart.id,
    coupon: req.body.couponCode,
  });

  return redirect(session.url);
}
```

What agents often do instead is get there in stages.

First they extract a fake owner so the route looks “cleaner”:

```ts
export async function startCheckout(input: {
  userId: string;
  cartId: string;
}) {
  return await stripe.checkout.sessions.create({
    customer: input.userId,
    cartId: input.cartId,
  });
}

export async function postCheckout(req: Request) {
  const cart = await carts.getActiveCart(req.userId);

  const session = await startCheckout({
    userId: cart.userId,
    cartId: cart.id,
  });

  return redirect(session.url);
}
```

Then they decide the route should not construct the payload inline, so they add one more local name:

```ts
type CheckoutInput = {
  userId: string;
  cartId: string;
};

function buildCheckoutInput(cart: Cart): CheckoutInput {
  return { userId: cart.userId, cartId: cart.id };
}

export async function postCheckout(req: Request) {
  const cart = await carts.getActiveCart(req.userId);
  const input = buildCheckoutInput(cart);
  const session = await startCheckout(input);

  return redirect(session.url);
}
```

Then the coupon requirement arrives. Instead of editing the real call directly, they preserve the old shape and add another one beside it:

```ts
type CheckoutInput = {
  userId: string;
  cartId: string;
};

type CheckoutContext = {
  userId: string;
  cartId: string;
  couponCode?: string;
};

function buildCheckoutInput(cart: Cart): CheckoutInput {
  return { userId: cart.userId, cartId: cart.id };
}

function buildCheckoutContext(
  input: CheckoutInput,
  couponCode?: string,
): CheckoutContext {
  return { ...input, couponCode };
}

export async function startCheckout(input: CheckoutContext) {
  return await stripe.checkout.sessions.create({
    customer: input.userId,
    cartId: input.cartId,
    coupon: input.couponCode,
  });
}

export async function postCheckout(req: Request) {
  const cart = await carts.getActiveCart(req.userId);
  const input = buildCheckoutInput(cart);
  const context = buildCheckoutContext(input, req.body.couponCode);
  const session = await startCheckout(context);

  return redirect(session.url);
}
```

Nothing terrible happened there, and that is exactly the issue.

Each step looks fine. It even looks cleaner in a narrow sense, but the code got worse. The feature now has multiple names for almost the same shape, extra helpers, and a call flow that exists mostly to preserve the previous refactor.

This is shape churn. You get `CheckoutInput`, `CheckoutContext`, `CheckoutRequest`, `CheckoutData`, and `OrderCheckoutData`, even though the feature still mostly means the same thing. The labels multiply faster than the design changes.

That is one version of slop.

Another version is the little helper pyramid agents love to build.

A human will often leave the main flow inline when the steps only matter together:

```ts
export async function prepareShipment(order: Order) {
  const warehouse = await selectWarehouse(
    order.items,
    order.shippingAddress,
  );
  const postage = calculatePostage(
    order.items,
    order.shippingAddress,
    warehouse,
  );
  return await buyShippingLabel({
    orderId: order.id,
    warehouseId: warehouse.id,
    postage,
  });
}
```

Agents often decide the top-level function should look shorter, so they collapse adjacent steps into awkward combined helpers:

```ts
async function selectWarehouseAndCalculatePostage(
  order: Order,
) {
  const warehouse = await selectWarehouse(
    order.items,
    order.shippingAddress,
  );
  const postage = calculatePostage(
    order.items,
    order.shippingAddress,
    warehouse,
  );
  return { warehouse, postage };
}

async function buildAndBuyShippingLabel(
  order: Order,
  shipping: { warehouse: Warehouse; postage: Money },
) {
  return await buyShippingLabel({
    orderId: order.id,
    warehouseId: shipping.warehouse.id,
    postage: shipping.postage,
  });
}

export async function prepareShipment(order: Order) {
  const shipping = await selectWarehouseAndCalculatePostage(order);
  return await buildAndBuyShippingLabel(order, shipping);
}
```

The top-level function got shorter, but the design got worse. The real sequence is now hidden behind helper names that only make sense in this one flow. That is the pyramid structure I keep seeing in AI code: fewer lines in the main function, more sideways indirection everywhere else.

Another thing agents do once they have created extra layers is forget where trust and error ownership already live.

If the route boundary already owns error translation, or if the caller is supposed to let failures bubble, the internal path should usually just `await` and fail normally. Instead, agents start wrapping every step in local `try/catch` blocks and inventing local error machinery:

```ts
type CheckoutResult =
  | { ok: true; session: Stripe.Checkout.Session }
  | {
      ok: false;
      code: "checkout_failed" | "invalid_coupon";
      message: string;
    };

function logCheckoutError(error: unknown, stage: string) {
  console.error("checkout failed", { stage, error });
}

function toCheckoutErrorState(): CheckoutResult {
  return {
    ok: false,
    code: "checkout_failed",
    message: "Unable to start checkout.",
  };
}

function toInvalidCouponErrorState(): CheckoutResult {
  return {
    ok: false,
    code: "invalid_coupon",
    message: "Coupon code is invalid.",
  };
}

function handleCheckoutError(
  result: Extract<CheckoutResult, { ok: false }>,
) {
  if (result.code === "checkout_failed") {
    return json(result, { status: 500 });
  }

  console.error("unhandled checkout error state", result);
}

export async function startCheckout(
  input: CheckoutContext,
): Promise<CheckoutResult> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: input.userId,
      cartId: input.cartId,
      coupon: input.couponCode,
    });

    return { ok: true, session };
  } catch (error) {
    logCheckoutError(error, "startCheckout");
    return toCheckoutErrorState();
  }
}

export async function postCheckout(req: Request) {
  try {
    const cart = await carts.getActiveCart(req.userId);

    if (req.body.couponCode && req.body.couponCode.length > 64) {
      return handleCheckoutError(toInvalidCouponErrorState());
    }

    const input = buildCheckoutInput(cart);
    const context = buildCheckoutContext(input, req.body.couponCode);
    const result = await startCheckout(context);

    if (!result.ok) {
      return handleCheckoutError(result);
    }

    return redirect(result.session.url);
  } catch (error) {
    logCheckoutError(error, "postCheckout");
    return handleCheckoutError(toCheckoutErrorState());
  }
}
```

That is fake safety too. Nothing new becomes true in those catch blocks. They do not recover, normalize, or translate anything. They just add noise, duplicate logging, ad hoc error states, and increasingly ugly types because the agent stopped trusting the caller and forgot that error handling already belongs at the boundary. The return type gets worse too. `postCheckout` stopped being an obvious "returns a redirect or throws" function and turned into something much murkier, effectively `Promise<Response | undefined>`.

And bare rethrows are not even the only version. Models also love to `console.error` and throw, wrap the failure in a generic `new Error("checkout failed")`, return `null`, return `{ ok: false }`, or log the same error at three different layers. Once that starts, the types usually get weird too: `Result` unions, helper-specific error shapes, `Extract<>` gymnastics, and local aliases whose only job is to carry the extra branches. It all comes from the same mistake: the catch block does not own a real decision.

What this should usually look like is much simpler:

```ts
export async function postCheckout(req: Request) {
  const cart = await carts.getActiveCart(req.userId);

  const session = await stripe.checkout.sessions.create({
    customer: cart.userId,
    cartId: cart.id,
    coupon: req.body.couponCode,
  });

  return redirect(session.url);
}
```


Now the flow is obvious again. The return type is obvious again. And if `getActiveCart` already throws when no cart exists, this function should trust that contract instead of re-checking it. The only boundary that needs to decide how checkout failures become HTTP responses is the boundary that already owns that decision.

Another version is when the model refuses to consolidate around the new correct shape and instead creates a second function or wraps the first one.

Say you start with this:

```ts
export async function getDisplayPrice(
  productId: string,
  customerGroup: CustomerGroup,
) {
  const price = await pricingApi.getPrice(productId, "USD");
  return applyCustomerDiscount(price, customerGroup);
}
```

Now you want currency support. A human who understands the system would usually extend the real owner:

```ts
export async function getDisplayPrice(
  productId: string,
  customerGroup: CustomerGroup,
  currency: Currency = "USD",
) {
  const price = await pricingApi.getPrice(productId, currency);
  return applyCustomerDiscount(price, customerGroup);
}
```

What agents often do instead is something like this:

```ts
export async function getDisplayPrice(
  productId: string,
  customerGroup: CustomerGroup,
) {
  const price = await getProductPrice(productId);
  return applyCustomerDiscount(price, customerGroup);
}

export async function getProductPrice(productId: string) {
  return await pricingApi.getPrice(productId, "USD");
}
```

Or even this:

```ts
export async function getDisplayPrice(
  productId: string,
  customerGroup: CustomerGroup,
  currency: Currency = "USD",
) {
  const price = await getLocalizedProductPrice(productId, currency);
  return applyCustomerDiscount(price, customerGroup);
}

export async function getProductPrice(productId: string) {
  return await pricingApi.getPrice(productId, "USD");
}

export async function getProductPriceWithCurrency(
  productId: string,
  currency: Currency,
) {
  return await pricingApi.getPrice(productId, currency);
}

export async function getLocalizedProductPrice(
  productId: string,
  currency: Currency,
) {
  return await getProductPriceWithCurrency(productId, currency);
}
```

This is the thing I keep seeing. The model creates new instead of consolidating around the truthful owner. If a function owns a real boundary or invariant, edit that function. If it owns nothing and just forwards arguments, delete it instead of extending it.

Instead, agents are biased toward preserving callers, preserving old structure, and creating siblings, wrappers, and helpers that can coexist with the original. They also keep temporary migration seams long after the migration is over, because deleting the bridge feels riskier than leaving it behind.

That is why AI refactors often feel fake. They move code around, but they do not really consolidate the system around the new truth. And once the helper chain exists, agents often deepen it the wrong way by spreading one action across more shallow files instead of building one deeper module that actually owns the behavior.

## 4. In the age of agents, rewrites are often better than refactors, and agents do the opposite

This is the part I feel strongest about.

Historically, people have been taught that refactoring is good and rewrites are bad. At the system level, that is still mostly true, and big-bang rewrites are still usually a mistake.

But at the module level, I think the tradeoff changed a lot once writing code became instant.

If a module has drifted far enough away from the thing it actually does, rewriting that module so it reflects the current system truth is often much cheaper and much safer than preserving the old shape through one more refactor.

Agents do not seem to follow that instinct at all.

They refactor aggressively by introducing indirection, preserving historical call graphs, adding helpers instead of deleting them, creating “better” layers around the old layer instead of replacing it, and adding configuration hooks for future cases nobody has yet.

That is a huge trap.

So what do I want instead?

I want agents to stop preserving internal structure just because it already exists.

If a file has changed so much that its names, helper chain, and data flow no longer match what it really does, I would rather rewrite that module than keep patching it.

I do not mean rewrite the whole system. I mean rewriting one module or subsystem so it reflects the current truth of the codebase. If we own all the callers, we should update all the callers. We should not keep old internal behavior around just for backwards compatibility theater. The exception is real public API surface that actually needs versioning or a deprecation path.

In practice, that means something like this:

```ts
export async function handleOAuthCallback(input: RequestInput) {
  const parsed = oauthCallbackSchema.parse(input);

  const provider = new UpstreamOAuthProvider({
    target: {
      tenantId: parsed.tenantId,
      userId: parsed.userId,
      upstreamServerId: parsed.upstreamServerId,
    },
    redirectUri: parsed.redirectUri,
  });

  const session = await provider.complete(parsed.code);
  await saveOAuthSession(session);
  return toResponse(session);
}
```

The export is the same, the saved behavior is the same, and the response contract is the same. What changed is that the fake phases are gone, the duplicate types are gone, and there is one actual shape inside the feature again.

That is the kind of rewrite I want agents to get comfortable with.

To be clear, I am not saying “rewrite everything whenever you feel like it.” There are plenty of times where the safer move is still a smaller patch: weak tests, unclear behavior, protocol boundaries, migration-heavy changes, published libraries. In those cases, minimum-diff behavior can be completely rational.

But I think it is important to notice what that means. It does not mean the old structure is good; it means your confidence is weak.

That distinction matters a lot.

The practical question, then, is how I actually get the agent to do the right thing more often.

The biggest thing is that I do not leave the instruction vague.

If I say “clean this up,” “make this code better,” or “refactor this,” I usually get exactly this kind of polite refactor: extra wrappers, renamed shapes, defensive catches, preserved paths, and increasingly crazy local types, plus all the other structure-preserving moves that keep the code looking tidy while making it worse. Models are not just conservative about behavior. They are structurally conservative about existing function shapes, and that is often worse.

So instead I say something more like:

```text
Keep the exported API the same.
Ignore the current helper split.
Rewrite this module so the flow is direct.
Delete types and wrappers that only rename data.
Update callers instead of preserving the old path.
```

And if I really want a better result, I force the model to show its work first:

```text
Before editing:

1. List the contracts that must stay stable.
2. List the helpers, wrappers, and types that should be deleted.
3. Name the one main internal shape after the rewrite.
4. List the tests to add or tighten first.
5. Say whether this is safe to rewrite as one module. If not, say why not.

Then do one rewrite of the module, not a helper-by-helper refactor.
```

That changes the output a lot, because it forces the model to separate the behavior that must stay from the structure that can go.

My actual loop is pretty boring. First I tell the agent to keep the outside the same and ignore the current helper chain. Then I ask for one rewrite of the module, not another incremental refactor. After that I run structural checks for dead exports, duplicate types, cycles, and bad escape hatches like `as any`, and then I do one more pass whose only job is deletion. If the change is risky, I tighten tests around the behavior users can see before the rewrite, but I do not think testing is the center of this problem.

That last step matters more than people think, because agents are good at adding the replacement and much worse at removing the corpse.

This is why I ended up writing down a lot of these opinions in the skill repo. I wanted rules that push back against the default behavior: delete obsolete code, delete temporary migration layers once the cutover is done, do not add wrappers that only rename data, do not preserve old compatibility paths, derive from a single source of truth, use the canonical named type instead of inventing a local stand-in, prefer one canonical shape inside a feature, and stop treating every existing helper as sacred just because it is already there.

I do not think the old advice was wrong. I think the pressure changed. We can generate code much faster now, which means bad structure spreads faster too.

So the job is not just “make it work.” The job is to stop a fast code generator from turning the codebase into a museum of yesterday's decisions.

That means fewer fake layers, fewer compatibility paths, fewer duplicate definitions of the same idea, more deletion, less speculative configuration, and more willingness to rewrite one module cleanly instead of patching it for the fifth time.

Generating code got easier, but keeping the code honest did not.
