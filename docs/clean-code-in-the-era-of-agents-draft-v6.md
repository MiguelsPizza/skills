
# Clean Code in the Era of Agents

One thing that seems to confuse a lot of newer people about coding agents is that both of these statements are true at the same time: they often write decent code, and AI-heavy codebases still tend to get weird over time. If the diff looks reasonable and the feature works, what exactly is everyone complaining about?

I do not think the answer is that we suddenly need a brand new theory of clean code. Most of the fundamentals were already right before agents showed up. Single source of truth is not new. Deleting obsolete code is not new. Updating callers instead of leaving compatibility paths around is not new. Avoiding fake abstractions is not new either.

What feels different is how reliably agents push against those fundamentals, even when you ask them to clean up. Nothing has to be obviously broken for that to happen. The repo just gets a little less clear about where things are supposed to live, and then each later change takes more judgment than it should.

That is why this feels confusing at first. A lot of AI slop is not ugly code. It is code that looks fine until you have to change it three more times.

For me, the center of this is pretty simple: agents keep creating parallel truths, and once those are there they tend to preserve them instead of folding them back into the real owner.

## Parallel truths

Single source of truth is one of those fundamentals. Agents are just unusually good at breaking it in ways that still look pretty normal in a diff.

Here is a clean starting point:

```ts
export const ORDER_STATUSES = ["pending", "paid", "shipped"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const createOrderInputSchema = z.object({
  userId: userIdSchema,
  couponCode: z.string().trim().min(1).optional(),
  items: z.array(
    z.object({
      productId: productIdSchema,
      quantity: z.number().int().positive(),
    }),
  ),
  status: z.enum(ORDER_STATUSES).default("pending"),
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

export async function createOrder(input: CreateOrderInput) {
  return await ordersApi.create(input);
}
```

Then an agent lands a checkout feature in another file:

```ts
type CheckoutRequest = {
  userId: string;
  couponCode?: string;
  items: Array<{ productId: string; quantity: number }>;
  status: "pending" | "paid" | "shipped";
};

const CHECKOUT_STATUSES = ["pending", "paid", "shipped"];

const checkoutRequestSchema = z.object({
  userId: z.string(),
  couponCode: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
    }),
  ),
  status: z.enum(["pending", "paid", "shipped"]),
});

function toCheckoutRequest(input: CreateOrderInput): CheckoutRequest {
  return {
    userId: input.userId,
    couponCode: input.couponCode,
    items: input.items,
    status: input.status,
  };
}
```

If you just read that file, it does not look outrageous. But now checkout has its own request type, its own status list, and its own schema. The newer version is also weaker than the original one. `userIdSchema` and `productIdSchema` turned into plain strings, and the quantity check got flattened too.

Then the codebase moves a little more. Somebody adds `"refunded"` to `ORDER_STATUSES` and updates the real owner, but misses the checkout copy because it looks local. Somebody else changes `createOrderInputSchema`, but forgets `checkoutRequestSchema` because it lives in a different file with a different name. Then another agent comes along, sees `CheckoutRequest`, and starts using that instead of `CreateOrderInput` because it is nearby and already type-checks.

That is the part people miss when they only look at one diff. The real problem is not the duplicate by itself. The real problem is that a second place now exists that looks like the right place to make future changes.

The better version is boring:

```ts
const checkoutRequestSchema = createOrderInputSchema;

export async function createOrder(input: CreateOrderInput) {
  return await ordersApi.create(input);
}
```

Or, if checkout really owns a subset:

```ts
const checkoutRequestSchema = createOrderInputSchema.pick({
  userId: true,
  couponCode: true,
  items: true,
  status: true,
});
```

That is what I mean by single source of truth in this context. Not “be elegant.” Just do not create another local owner for information the codebase already had.

## Then the wrappers start

This is another old maintainability problem, but agents have a very specific version of it. If you tell them to clean something up, they often preserve the structure they can already see and add one more neat-looking layer around it.

Once there are multiple local versions of the same concept, agents usually start building around them instead of cleaning them up.

The first step usually looks harmless:

```ts
export async function startCheckout(input: CheckoutRequest) {
  return await createOrderWithCoupon(input);
}
```

By itself that is not some horrifying bug. It is just one more function. But it also does not really do anything. It does not validate anything, normalize anything, or own any real boundary. It just gives the path through the code another name.

Then somebody adds the sibling function it depends on:

```ts
export async function createOrderWithCoupon(input: {
  userId: string;
  couponCode?: string;
  items: Array<{ productId: string; quantity: number }>;
  status: "pending" | "paid" | "shipped";
}) {
  return await createOrder({
    userId: input.userId,
    couponCode: input.couponCode,
    items: input.items,
    status: input.status,
  });
}
```

What bothers me about that one is not just that it adds another function. It also quietly steals ownership of the shape by writing it inline instead of using `CreateOrderInput`.

Then, because nobody wants to touch the older callers, this shows up too:

```ts
export async function createOrderLegacy(
  userId: string,
  items: OrderItem[],
  couponCode?: string,
) {
  return await createOrder({
    userId,
    items,
    couponCode,
    status: "pending",
  });
}
```

At that point the feature has the original owner, a sibling helper, a wrapper that mostly just forwards, and a legacy path that never got removed. If you read the diffs one at a time, every move feels survivable. That is exactly why codebases end up like this. Nothing forces a cleanup, so the extra structure just stays.

The version you actually want after the dust settles is still just this:

```ts
export async function createOrder(input: CreateOrderInput) {
  return await ordersApi.create(input);
}
```

That is the part AI tools consistently resist. They are much more comfortable preserving old structure and adding one more layer than they are collapsing the system back down to one owner.

## Tests will not catch most of this

Testing is similar. The old advice still mostly holds. Good boundary tests matter. They just solve a different problem from the one agents keep creating here.

You can have a perfectly reasonable test like this:

```ts
it("creates an order with a coupon", async () => {
  const response = await request(app)
    .post("/orders")
    .send({
      userId: "user_123",
      couponCode: "SAVE10",
      items: [{ productId: "prod_1", quantity: 1 }],
      status: "pending",
    });

  expect(response.status).toBe(201);
});
```

And that test can still pass while the route validates with `createOrderInputSchema`, the feature re-validates with `checkoutRequestSchema`, and a wrapper converts one shape into the other.

You can even end up with this:

```ts
export const createOrderRoute = publicProcedure
  .input(createOrderInputSchema)
  .handler(({ input }) => createOrder(input));

export async function createOrder(input: CreateOrderInput) {
  const parsed = checkoutRequestSchema.parse(input);
  return await ordersApi.create(parsed);
}
```

The boundary already validated the input. The second schema is not buying you safety. It is buying you another place for the contract to drift.

That is why I do not think testing is the center of this problem. Good boundary tests matter. They just are not very good at telling you whether the repo still has one honest owner for the concept.

## The copied-pattern problem

This is the part that feels most specific to agents.

One file introduces this:

```ts
type CheckoutData = {
  userId: string;
  couponCode?: string;
  items: OrderItem[];
  status: "pending" | "paid" | "shipped";
};
```

The next file lands this:

```ts
type OrderCheckoutData = {
  userId: string;
  couponCode?: string;
  items: OrderItem[];
  status: "pending" | "paid" | "shipped";
};
```

Then a third file gets this:

```ts
function toCheckoutData(input: CreateOrderInput): CheckoutData {
  return {
    userId: input.userId,
    couponCode: input.couponCode,
    items: input.items,
    status: input.status,
  };
}
```

That is how one local mistake turns into house style. The model does not know whether the original example was intentional, temporary, or already wrong. It just sees something nearby that compiles and keeps going.

So when I review AI-generated diffs now, I am mostly asking a simpler question: did this change make the repo clearer, or did it leave behind one more local version of something that already had an owner?

I do not think the old advice about maintainability was wrong. I think the pressure changed. We can generate code much faster now, which means these bad patterns spread much faster too. A lot of what I end up doing with agent-focused maintainability rules is just trying to push the model back toward those older fundamentals when its default behavior drifts away from them.
