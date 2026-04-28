# Clean Code in the Era of Agents

One thing that seems to confuse a lot of newer people about coding agents is that both of these statements are true at the same time: they often write decent code, and AI-heavy codebases still tend to get weird over time. If the diff looks reasonable and the feature works, what exactly is everyone complaining about?

The shortest version I have is that slop is code that seems reasonable when you read it locally, but gets less honest about the system as a whole. The file in front of you looks fine. The repo behind it is quietly accumulating second versions of things it already knew.

That is why this feels confusing at first. A lot of AI slop is not ugly code. It is code that looks fine until you have to change it three more times.

I think the center of this is pretty simple: agents keep creating parallel truths.

## Parallel truths

The most obvious version is when the codebase already has a real owner for a concept, and the agent creates another local one anyway.

Start here:

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

That is enough to start the drift. The type exists twice. The role list exists twice. The next agent sees `UserInfo` and copies it. Then someone adds `"guest"` to `userRoleSchema`, updates the real owner, and misses `UserInfo` and `USER_ROLES`.

The same thing happens with constants that look even more harmless:

```ts
export const ORDER_STATUSES = ["pending", "paid", "shipped"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
```

Then an agent lands this in a checkout file:

```ts
const DEFAULT_STATUS = "pending";
const CHECKOUT_STATUSES = ["pending", "paid", "shipped"];
```

Then later somebody adds `"refunded"` to `ORDER_STATUSES` and forgets the checkout copy because it looks like local UI glue instead of a second owner.

Schemas drift the same way.

Suppose you already have this:

```ts
export const createOrderInputSchema = z.object({
  userId: userIdSchema,
  couponCode: z.string().trim().min(1).optional(),
  items: z.array(
    z.object({
      productId: productIdSchema,
      quantity: z.number().int().positive(),
    }),
  ),
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

At that point there are two validators for one concept, and the weaker one is likely to be the one somebody edits first. The agent took branded or constrained fields and flattened them into plain strings and numbers because that was locally convenient.

The better version is boring:

```ts
const checkoutRequestSchema = createOrderInputSchema;
```

Or, if the route really owns a subset:

```ts
const checkoutRequestSchema = createOrderInputSchema.pick({
  userId: true,
  couponCode: true,
  items: true,
});
```

That is the pattern I keep seeing over and over. A type exists, so the agent writes another one. A constant exists, so the agent copies the literal. A schema exists, so the agent hand-writes a second schema beside it. Nothing looks catastrophic in the diff, but the repo stops being clear about where future changes are supposed to go.

This is also why I think single source of truth is a much bigger deal in AI-heavy codebases than people sometimes realize. It is not just a cleanup preference. It is how you stop one local convenience from turning into four update sites six weeks later.

## Editing the owner vs creating siblings

The other big failure mode is that the codebase already has a function that owns some behavior, but changing that function would require touching callers, so the agent grows another function beside it instead.

Suppose you start with this:

```ts
export async function createOrder(input: CreateOrderInput) {
  return await ordersApi.create(input);
}
```

Then checkout picks up coupon support. The straightforward version is not very exciting:

```ts
const input: CreateOrderInput = {
  userId,
  couponCode,
  items,
};

return await createOrder(input);
```

What agents often do instead is this:

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

That example is doing two bad things at once. It creates a sibling function, and it also creates a second local owner for the shape by inlining the object type instead of using `CreateOrderInput`.

Then a little later that turns into this:

```ts
export async function startCheckout(input: CheckoutRequest) {
  return await createOrderWithCoupon(input);
}
```

And a little later it turns into this:

```ts
export async function createOrderLegacy(
  userId: string,
  items: OrderItem[],
  couponCode?: string,
) {
  return await createOrder({ userId, items, couponCode });
}
```

Now the feature has multiple shapes, multiple entry points, and at least one compatibility path that exists only because the old path never got removed.

If you read the diff line by line, every step looks survivable. That is the problem. The code slowly gets harder to reason about without ever producing one obviously disastrous patch.

This is what the cleaned-up version should look like after the dust settles:

```ts
export async function createOrder(input: CreateOrderInput) {
  return await ordersApi.create(input);
}
```

That is it. One function. One input type. Callers updated. Old paths deleted.

The wrapper story is similar. A lot of AI-generated wrappers do not normalize anything, validate anything, enforce anything, or own any lifecycle. They just rename the path through the code.

```ts
export async function submitCheckout(input: CheckoutRequest) {
  return await createOrder(input);
}
```

If deleting that function would lose nothing important, it should not be there.

This is the part where a lot of AI refactors start to feel fake. The diff looks clean, there are more helpers, maybe the names got nicer, but the system itself did not get more honest. It just got more ceremonial.

## Tests do not save you from this

Testing matters, but it is not the center of this problem.

You can have a perfectly reasonable boundary test like this:

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

And that test can still pass while the route validates with `checkoutRequestSchema`, the core function expects `CreateOrderInput`, and a wrapper converts one shape into the other.

You can also end up with a code path like this:

```ts
export const createOrderRoute = publicProcedure
  .input(createOrderInputSchema)
  .handler(({ input }) => createOrder(input));

export async function createOrder(input: CreateOrderInput) {
  const parsed = checkoutRequestSchema.parse(input);
  return await ordersApi.create(parsed);
}
```

The boundary already validated the input. The duplicate schema inside the feature is not buying you safety. It is buying you another place for the contract to drift.

What tests usually tell you here is that the product still behaves correctly from the outside. What they do not tell you is whether the code still has one honest owner for the concept.

## The copied-pattern problem

The part that feels most specific to AI is how fast bad patterns spread once one of them lands.

Say one route introduces this:

```ts
type CheckoutData = {
  userId: string;
  couponCode?: string;
  items: OrderItem[];
};
```

The next route lands this:

```ts
type OrderCheckoutData = {
  userId: string;
  couponCode?: string;
  items: OrderItem[];
};
```

Then a third file gets this:

```ts
function toCheckoutData(input: CreateOrderInput): CheckoutData {
  return {
    userId: input.userId,
    couponCode: input.couponCode,
    items: input.items,
  };
}
```

That is how one local mistake turns into house style. The model does not know whether the original example was intentional, temporary, or already wrong. It just sees a nearby pattern and continues it.

That is why, when I review AI-generated diffs now, I am usually looking for the same kinds of problems: duplicate types, second schemas, copied constants, sibling helpers, wrappers that only forward data, and old paths that should have been deleted but got preserved instead.

I do not think the old advice about maintainability was wrong. I think the pressure changed. We can generate code much faster now, which means these bad patterns spread much faster too. A lot of the job is just refusing to let the repo accumulate second versions of things it already had.
