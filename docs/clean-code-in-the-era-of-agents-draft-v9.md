# Clean Code in the Era of Agents

When I think about AI slop, I usually think about the pre-AI version first.

My first job at Amazon was maintaining a huge old Rails application that was something like twenty years old and well over two million lines of code. My manager was spinning up a new team around it and was still learning the system himself, nobody who had originally written it was still at the company, and trying to understand what the thing actually did, who was still using it, and why certain decisions had been made felt less like software work and more like archaeology. Every time we touched it, something broke. It had a test suite, but it was not in CI and had apparently not worked in years. After a few months of working on it, we realized that something like half the codebase was dead, and that another team somewhere else in the company had already rebuilt the whole thing in Java and moved the users over. Almost nobody on our side had any idea.

That is a worst-case human tech debt story, but it did not happen because anyone wanted a terrible system. It happened because people churned out, ownership got fuzzy, cleanup never really won against feature pressure, and eventually the code stopped telling the truth about the product. This was a reality of software for a long time, feature work is prioritized and tech debt never get the time budge it deserves. Hypothetically with agents we should be able to have both.

That experience mattered to me later, because when I left Amazon and started using AI tools without real limits in codebases I fully owned, I really thought I was going to avoid that whole class of problem. I was trying very hard not to recreate it. I picked what I thought was the best TypeScript stack I knew how to build with, kept everything as single-source-of-truth as I could, had the data model driving the rest of the system, shared types between frontend and backend, leaned on inference as much as possible, and spent a huge amount of time on cleanup.

And it still accumulated tech debt much faster than I expected.

That was the part that confused me for a while, because I was not using the agents in some reckless "just ship it" way. I was spending a most of my tokens on cleanup, simplification, and refactors. But even then the agents were just really bad at making the code more readable or actually making the system simpler. I would try to remove churn while working on a feature and the diff would still come out net positive lines, not because I had added some major new capability, but because the cleanup itself kept introducing more structure.

I think the answer is that tech debt is not just something agents create when you use them carelessly. A lot of it is structural to the way they write, clean up, and refactor code by default.

If you have read *Working Effectively with Legacy Code*, I think that book is actually a better frame for AI code than most of the prompt-engineering discourse. Feathers' line is that legacy code is code without tests. I would extend that a little for the agent era. A lot of AI code has tests, sometimes plenty of them, and it still feels like legacy code because the system is no longer honest about where the real truth lives.

And if you have read *Clean Code*, I do not think the core principles suddenly stopped applying. Duplication is still bad. Misleading names are still bad. Hidden ownership is still bad. Obsolete code is still bad. The only thing that changed is that now all of those problems can be produced much faster, and they can be produced even while the diff looks pretty clean.

That is why I keep coming back to this definition: slop is code that is locally reasonable and globally dishonest.

It works, it type-checks, the names often look fine, the tests may even pass, but the codebase stops being clear about where a concept lives, what shape is canonical, which function really owns the behavior, and which layers are just historical residue.

some examples:

## Parallel truths

Start with something clean:

```ts
export const userSchema = z.object({
  id: userIdSchema,
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
});

export type User = z.infer<typeof userSchema>;
```

Then an agent lands this in another file:

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

Agent do thid ALL THE TIME. This is default behavior and a vilation of SSOT

The same thing happens with schemas:

```ts
export const createOrderInputSchema = z.object({
  userId: userIdSchema,
  couponCode: z.string().trim().min(1).optional(),
  items: z.array(orderItemSchema).min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
```

and then later:

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

What I want instead is much more boring:

```ts
export const checkoutRequestSchema = createOrderInputSchema;
```

Or if checkout truly owns a subset:

```ts
export const checkoutRequestSchema = createOrderInputSchema.pick({
  userId: true,
  couponCode: true,
  items: true,
});
```

This sort of thing is easy to clean up on a refactor/cleanup pass though and models ususally don't need much nudging to clean up correctly. The bigger issue is when shapes change and the model thinks the old types/shapes need to be respected.

## Shape churn

This is the pattern that made me feel like the cleanup pass itself was haunted.

You start with a pretty direct feature:

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

You extend the future couponCode and then ask the agent to "cleans it up":

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

Every piece of that looks locally defensible. The names are not insane. The types are not crazy. The code still works.

But the feature still mostly means one thing and now it has multiple shapes, multiple names, and a call flow that exists mostly to preserve the previous cleanup pass. That is shape churn. The labels multiply faster than the design changes.

What I wanted all along was still just this:

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

If a function does not make a new fact true, and all it really does is rename, reshape, or forward the same data, it is probably not cleaning up the code. It is preserving history in executable form.

## Helper pyramids

This is a close cousin of shape churn, but the smell is slightly different. The top-level function gets shorter and the system gets harder to read.

A direct flow (The way I would write it myself):

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

The agent version:

```ts
async function selectWarehouseAndCalculatePostage(order: Order) {
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

Again, nothing obviously absurd happened. But the real sequence is now hidden behind helper names that only make sense in this one flow. This is the kind of code that feels cleaner on first read and worse on second read, because now you have to mentally inline the feature back together to understand it.

This is one of the places where I think people sometimes get the wrong lesson from "small functions" and "clean code." Small functions are good when they isolate a real concept, a real boundary, or a reusable operation. They are not good when they break one coherent flow into a little staircase of local helper names.

## Fake safety

Once the extra layers exist, agents start defending them.

Here is a simple version of what the code often should be:

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

Here is the kind of "safer" version agents love to grow:

```ts
type CheckoutResult =
  | { ok: true; session: Stripe.Checkout.Session }
  | {
      ok: false;
      code: "checkout_failed" | "cart_not_found";
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
    const result = await startCheckout({
      userId: cart.userId,
      cartId: cart.id,
      couponCode: req.body.couponCode,
    });

    if (!result.ok) {
      return json(result, { status: 500 });
    }

    return redirect(result.session.url);
  } catch (error) {
    logCheckoutError(error, "postCheckout");
    return json(toCheckoutErrorState(), { status: 500 });
  }
}
```

Nothing new became true in most of those catch blocks. They did not recover, normalize in a meaningful way, or own a real boundary decision. They mostly added noise, duplicate logging, uglier types, and more branches for the next person to reason about.

Feathers is very right that tests and seams matter when you are changing legacy code. But this is one place where I think the agent-era failure mode is different. You can have tests around both versions and the second one is still worse. The tests may preserve behavior, but they do not rescue the structure from becoming dishonest.

What I want instead is usually either direct failure propagation or one real boundary translation, not both:

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

Or, if the route truly owns the translation:

```ts
export async function postCheckout(req: Request) {
  try {
    const cart = await carts.getActiveCart(req.userId);

    const session = await stripe.checkout.sessions.create({
      customer: cart.userId,
      cartId: cart.id,
      coupon: req.body.couponCode,
    });

    return redirect(session.url);
  } catch (error) {
    logger.error("checkout_failed", { error });
    return json({ code: "checkout_failed" }, { status: 500 });
  }
}
```

One owner. One decision. Not every internal hop trying to become a tiny error framework.

## Compatibility theater

This one is maybe the most frustrating because you can feel the model refusing to pay the real cost of the change.

You start with this:

```ts
export async function getDisplayPrice(
  productId: string,
  customerGroup: CustomerGroup,
) {
  const price = await pricingApi.getPrice(productId);
  return applyCustomerDiscount(price, customerGroup);
}
```

Now you need currency support. In a codebase you own, the truthful change is usually this:

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

This looks insane but it is a real example of Codex's output when I asked it to implement this feature with maintainability in mind.

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

## So what am I actually trying to get the agent to do?

Not magic. Just simpler and more truthful rewrites.

If AI code is basically legacy code, then Feathers is still right that you need a way to preserve behavior safely while you change structure. Characterization tests still matter. Seams still matter. Scratch refactoring still matters. But I think the agent-era update is that once you have enough confidence to move, you need to push much harder toward deletion and consolidation than the default model behavior will ever choose on its own.

What I am trying to get is:

```text
Keep the exported API the same.
Ignore the current helper split.
Rewrite this module so the flow is direct.
Delete types and wrappers that only rename data.
Update callers instead of preserving the old path.
```

And if I really want a better result:

```text
Before editing:

1. List the contracts that must stay stable.
2. List the helpers, wrappers, and types that should be deleted.
3. Name the one main internal shape after the rewrite.
4. List the tests to add or tighten first.
5. Say whether this is safe to rewrite as one module. If not, say why not.

Then do one rewrite of the module, not a helper-by-helper refactor.
```

That changes the output a lot, because it forces the model to separate behavior that must stay from structure that can go.

I do not think the thesis here is that coding agents are useless, or that clean code is obsolete, or that legacy-code books no longer apply. It is almost the opposite. Clean code matters more now. Legacy-code discipline matters more now. The problem is that the default agent behavior is structurally debt-generating, even when the diff looks polished and even when you are actively trying to fight the debt down.

That is why AI slop feels so confusing at first. It is not usually obviously bad code. It is code that looks fine while steadily turning into legacy code.

It is the same old structural dishonesty, just generated at the speed of light.
