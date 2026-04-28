# Clean Code in the Era of Agents

You will hear two things about coding agents that sound contradictory.

They often write decent code.

They also turn codebases into slop.

That only sounds inconsistent if you think slop means obviously bad code. Most of the time it does not. A lot of AI slop works, type-checks, and looks fine in a diff.

The best definition I have found is this: slop is code that is locally reasonable and globally dishonest.

It is locally reasonable because each change makes sense on its own. The helper name is fine. The wrapper is not absurd. The type is plausible. The tests still pass.

It is globally dishonest because the code stops telling the truth about where things really live. The system accumulates duplicate concepts, second owners, stale paths, and cleanup that preserves the wrong structure.

That is why AI-heavy codebases often feel strange before they look broken. Nothing in particular is screaming at you. The code just gets harder to change than it should be.

I do not think this requires a brand new theory of clean code. Most of the old advice was already correct. Single source of truth was right. Deleting obsolete code was right. Updating callers instead of leaving compatibility seams around was right.

What changed is the pressure.

Agents can add a lot of code very quickly, and they are biased toward preserving what already exists. That combination creates a specific kind of maintainability failure: the repo fills up with structures that were rational for one diff and dishonest for the system as a whole.

There are three failure modes I keep seeing.

## 1. Agents create parallel truths

This is the root problem.

An agent sees an existing schema, type, constant, or function, and instead of extending the real owner it creates a second local version nearby. Sometimes it does that because it missed the original. Sometimes it does it because copying feels safer than changing the real thing. The result is the same.

Start with something clean:

```ts
export const userSchema = z.object({
  id: userIdSchema,
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
});

export type User = z.infer<typeof userSchema>;
```

Then another file gets this:

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

Nothing there looks catastrophic. That is exactly the problem.

Now the same concept exists in two places. Future changes have two obvious update sites. The duplicate type looks local, so it is easier to miss. Then another agent sees `UserInfo` and starts using it because it is nearby and already compiles.

The same thing happens with schemas, constants, and module paths:

- a second schema instead of deriving from the canonical one
- an inline object shape instead of importing the named type
- copied constants instead of importing them
- a forwarding re-export that makes a symbol appear to live in two places

This is how a codebase becomes mechanically type-safe and conceptually fragile at the same time.

The fix is boring, which is why it works.

If the type can be derived, derive it. If the schema already exists, use it. If the codebase already has a canonical named type, import that instead of handwriting a local stand-in. If a function already owns the operation, extend that function instead of creating a sibling.

Single source of truth is not elegance here. It is change control.

## 2. Agents preserve structure and call it refactoring

This is the failure mode people usually mean when they say AI code feels weird.

The agent goes back to "clean up" the code, but instead of consolidating the design it preserves the existing helper chain and wraps it in one more tidy-looking layer. The top-level function gets shorter. The subsystem gets worse.

Suppose you start here:

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

Then the feature changes and you need an optional coupon code. The truthful edit is direct:

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

What agents often do instead is preserve the old shape and add neighbors:

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

Each step is locally defensible. Together they are dishonest.

The feature still mostly means one thing, but now it has multiple shapes, extra helpers, and a call flow that exists mainly to preserve the previous refactor. That is not simplification. It is shape churn.

The same pattern shows up in helper pyramids and pass-through wrappers:

- create a helper instead of editing the real owner
- split one action across several shallow files
- add a wrapper that mostly forwards arguments
- preserve the old path while introducing a new one beside it

This is why AI refactors often feel fake. They move code around, but they do not consolidate the system around the new truth.

## 3. Agents preserve backwards compatibility where none is needed

This is where private codebases quietly turn into museums.

A function changes shape. A module boundary moves. An internal helper is no longer the right owner. Instead of updating all callers, the agent adds a shim, overload, wrapper, or legacy path to keep the old structure alive.

Start here:

```ts
export async function getDisplayPrice(
  productId: string,
  customerGroup: CustomerGroup,
) {
  const price = await pricingApi.getPrice(productId, "USD");
  return applyCustomerDiscount(price, customerGroup);
}
```

Now you need currency support. If this is internal code and you own the callers, the right move is usually to change the real function:

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

What agents often do instead is preserve the old path and add siblings:

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

That is compatibility theater. The old structure is being preserved because changing all the callers feels riskier than leaving a seam behind.

Sometimes that caution is correct. Public APIs, migrations, published packages, and weak test coverage are real constraints.

But it is important to name the tradeoff accurately. In those cases the old structure is not good. Your confidence is weak.

That distinction matters because otherwise the temporary bridge never gets deleted.

## What to do instead

The habit I want more agents to have is simple: preserve contracts, not obsolete decomposition.

If the exported API has to stay stable, keep it stable. If tests need to pin observable behavior before you simplify internals, do that first. But once the outside is protected, stop treating the current helper split as sacred.

At the module level, rewrites are often better than polite refactors now.

Not system rewrites. Not big-bang rewrites. Module rewrites.

If a file has drifted far enough that its names, helper chain, and data flow no longer match what it really does, rewriting that module around the current truth is often cheaper and safer than preserving the old shape through one more "safe" refactor.

That usually means:

- keep the exported contract the same
- keep or tighten the behavior tests
- pick one canonical internal shape
- delete wrapper types that only rename data
- update callers instead of keeping the old path alive
- remove temporary compatibility layers once the cutover is done

The standard I care about is not "small diff." It is "truthful code."

## How I prompt for this now

Vague instructions get vague cleanup.

If I say "clean this up" or "refactor this," I often get exactly the wrong result: more wrappers, more helper names, more catch blocks, more temporary seams that never die.

So I make the request concrete:

```text
Keep the exported API the same.
Ignore the current helper split.
Rewrite this module so the flow is direct.
Delete types and wrappers that only rename data.
Update callers instead of preserving the old path.
```

And if I want a stronger result, I force the separation between stable behavior and disposable structure first:

```text
Before editing:

1. List the contracts that must stay stable.
2. List the helpers, wrappers, and types that should be deleted.
3. Name the one main internal shape after the rewrite.
4. List the tests to add or tighten first.
5. Say whether this is safe to rewrite as one module. If not, say why not.

Then do one rewrite of the module, not a helper-by-helper refactor.
```

That changes the output because it forces the model to identify what must survive and what is just historical residue.

My cleanup loop after that is boring:

1. Rewrite the module behind the stable contract.
2. Run structural checks for dead exports, duplicate types, cycles, and escape hatches like `as any`.
3. Do one more pass whose only job is deletion.

That last pass matters more than people think. Agents are good at adding the replacement and much worse at removing the corpse.

## The actual job

I do not think the old maintainability advice was wrong. I think code generation got cheaper and faster, which means bad structure spreads faster too.

The job is not just to make the feature work.

The job is to stop a fast code generator from turning the codebase into a museum of yesterday's decisions.

That means fewer parallel truths, fewer fake refactors, fewer compatibility paths, more deletion, and more willingness to rewrite one module cleanly instead of patching it for the fifth time.

Generating code got easier.

Keeping the code honest did not.
