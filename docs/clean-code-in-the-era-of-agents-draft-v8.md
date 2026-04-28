# Clean Code in the Era of Agents

When I think about AI slop, I usually think about the pre-AI version first.

My first job at Amazon was maintaining a huge old Rails application that was something like twenty years old and well over two million lines of code. My manager was spinning up a new team around it and was still learning the system himself, nobody who had originally written it was still at the company, and trying to understand what the thing actually did, who was still using it, and why certain decisions had been made felt less like software work and more like archaeology. Every time we touched it, something broke. It had a test suite, but it was not in CI and had apparently not worked in years. After a few months of working on it, we realized that something like half the codebase was dead, and that another team somewhere else in the company had already rebuilt the whole thing in Java and moved the users over. Almost nobody on our side had any idea.

That is a worst-case human tech debt story, but it did not happen because anyone sat down and tried to make a terrible system. It happened because people churned out, ownership got fuzzy, cleanup never really won against feature pressure, and eventually the code stopped telling the truth about the product. Huge parts of it still existed, but they no longer represented anything real.

That experience mattered to me later, because when I left Amazon and started using AI tools without real limits in codebases I fully owned, I really thought I was going to avoid that whole class of problem.

I was trying very hard not to recreate it. I picked what I thought was the best TypeScript stack I knew how to build with, kept everything as single-source-of-truth as I could, had the data model driving the rest of the system, shared types between frontend and backend, leaned on inference as much as possible, and spent a huge amount of time on cleanup. I was not doing the usual thing where you tell yourself you will come back for the maintainability work later. I was actively trying to keep the codebase clean the whole time.

And it still accumulated tech debt much faster than I expected.

That was the part that confused me for a while, because I was not using the agents in some reckless "just ship it" way. I was spending a lot of tokens on cleanup, simplification, and refactors. But even then the agents were just really bad at making the code more readable or actually making the system simpler. I would try to remove churn while working on a feature and the diff would still come out net positive lines. Not because I had added some major new capability, but because the cleanup itself kept introducing more structure. That made no sense to me for a while, but I think the answer is that tech debt is not just something agents create when you use them carelessly. A lot of it is structural to the way they write, clean up, and refactor code by default.

That is the thesis of this post, really. AI slop is not some brand new category of bad code, and it is not just what happens when people get lazy. It is the same old kind of structural dishonesty that always made codebases rot, except now it gets produced much faster, and more importantly it gets produced even when you are explicitly trying to reduce it.

That is why the usual contradiction around agents is not really a contradiction at all. People say coding agents write good code, and they also say AI codebases fall apart. Both things are true because a lot of slop is locally reasonable. It works, the types often look fine, the names are usually decent, the tests can still pass, and if you read the file in isolation it may not even look bad. The problem is that the system stops being honest about where the real truth lives.

That is still my favorite definition of slop: code that is locally reasonable and globally dishonest.

It is code with duplicate concepts, second owners, stale wrappers, helper chains that preserve old decisions, fake abstractions, defensive error machinery that does not own any real decision, and tests that can only tell you that the whole pile still behaves the same from the outside. Nothing in particular has to look dramatic for the codebase to get steadily harder to understand.

I do not think this means we need a completely new theory of clean code. Most of the old advice was already right. Single source of truth was right. Deleting obsolete code was right. Updating callers instead of leaving compatibility paths behind was right. The thing that changed is not the fundamentals, it is the pressure. When code generation gets cheap, the cost of bad structure goes up, because the bad structure can spread much faster than a human team would have produced it before.

The other thing that changed is that with human-written legacy systems, at least in theory, there was once a person you could go ask. There was someone who knew why a seam existed, or whether a wrapper was temporary, or which type was the real owner and which one was just local glue that never got cleaned up. With agents, a lot of the contributors are effectively temporary employees that disappear immediately. They are gone as soon as the diff lands. If the humans stop carrying the meaning of the code file by file, there is nobody else to ask later.

That is why I think tech debt is structural to agents unless you push back on their defaults very explicitly.

I think there are a few patterns behind most of it.

## 1. Agents create parallel truths

This is the one I keep coming back to because it is the root of a lot of the rest.

Agents constantly re-declare things the codebase already knew. They hand-write a type that could have been inferred. They create a second schema instead of using the first one. They copy a constant instead of importing it. They create a local type alias that is basically the same thing as the canonical named type somewhere else. They leave forwarding exports around so something appears to live in two places. They create a second function that mostly owns the same behavior as the first one, except now it has a slightly different signature and a slightly different name.

The reason this is such a nasty problem is that none of it looks that insane at the moment it happens.

If you start with something like this:

```ts
export const userSchema = z.object({
  id: userIdSchema,
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
});

export type User = z.infer<typeof userSchema>;
```

and then somewhere else an agent adds this:

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

that does not look like the end of the world. It still works. The type still looks reasonable. If you are moving quickly, it is easy to say this is just a local display shape or a little convenience alias and keep going.

But now the same concept exists in more than one place. Then somebody changes the schema and forgets the local copy because the local copy does not look important. Then another agent sees `UserInfo` nearby and uses it again. Then tests get written around the local copy, and now the duplicate shape has a little island of legitimacy around it. The same thing happens with schemas and constants. A second version appears, then it gets reused, then now there are two obvious places to update when the concept changes, and one of them is lying about being the owner.

That is what I mean by parallel truths. The codebase is no longer clear about where future changes are supposed to go.

If the type can be derived, derive it. If the schema already exists, use it. If there is already a canonical named type, import it instead of handwriting a local stand-in or using an inline object shape that quietly becomes a second owner. If there is already a real function that owns the behavior, extend it instead of creating a sibling.

The reason I care so much about single source of truth in agent-heavy codebases is not because it sounds elegant. It is because agents copy local examples very aggressively. One fake local owner does not stay isolated for long. It becomes the pattern the next agent reaches for.

## 2. Agents preserve structure and call it cleanup

This is the one that confused me the most when I first started using these tools seriously.

I would ask the agent to simplify something or clean it up, and the diff would come back looking fairly neat, but the code would somehow be harder to understand than before. The top-level function might be shorter, the helper names would look decent, the types were often not obviously wrong, and yet the real flow of the feature was now spread across more names and more files. It looked cleaner in a local sense and worse in the way that actually matters.

The pattern, I think, is that agents are very biased toward preserving whatever structure they can already see. They do not like deleting a helper if they can rename it. They do not like collapsing two shapes into one if they can add a conversion function. They do not like changing the existing owner if they can create another function beside it and move the new work there. They do not like updating callers if they can keep the old path alive and add a new one around it.

That is how you end up with the same feature slowly turning into `CheckoutInput`, `CheckoutContext`, `CheckoutRequest`, `CheckoutData`, `buildCheckoutInput`, `buildCheckoutContext`, `startCheckout`, `createCheckoutSession`, and some wrapper on top of the wrapper that only exists because of the previous cleanup pass.

Each individual move looks survivable. That is why this is so common. Nothing in the diff screams "this is the exact moment the codebase got worse." The system just becomes more indirect while still feeling tidy at the file level.

I think this is what people are usually pointing at when they say AI code feels weird. It is not that the code is full of syntax errors or obviously absurd abstractions. It is that the cleanup preserves the path the code took to get here instead of collapsing the code back down around what the feature actually is now.

That is why I care a lot about deleting shape churn and pass-through wrappers. If a helper does not establish a new invariant, own a real boundary, or guarantee some lifecycle behavior, it is probably just preserving history in executable form.

One of the best questions I know for this is: what new fact becomes true after this function runs?

If the answer is basically none, and all it did was rename, reshape, or forward the same data, then that layer is probably part of the problem.

## 3. Agents overproduce fake safety

This one shows up a lot once the extra layers already exist, because after the call graph gets deeper the model starts acting like every hop needs its own little defensive bunker.

You see `try/catch` blocks around internals that do not own any recovery decision. You see local result unions where there used to just be a function that either returned the thing or threw. You see `console.error` plus rethrow. You see `console.error` plus `return null`. You see ad hoc `ok: false` states that only exist because the agent decided some internal helper should stop throwing even though nothing meaningful got safer. The type signatures get worse, the flow gets murkier, and now every layer seems to think the layers above it cannot be trusted to handle failure.

This is usually the same mistake in a different form. The agent is optimizing for a kind of local caution that feels safe in a diff. But if a catch block does not recover, translate at a real boundary, retry with a different strategy, or guarantee cleanup, then it is not really making the system safer. It is mostly adding noise and more places for behavior to drift.

The same thing happens with null checks. If a function contract already says the thing exists or throws, and then every downstream caller starts re-checking it just in case, the system has stopped trusting its own contracts. Once that happens, types get uglier, control flow gets harder to read, and the code starts looking more "robust" while actually becoming less honest.

I do not think agents do this because they are dumb. I think they do it because "defensively preserve every possibility" is a very easy local heuristic. But that heuristic scales terribly inside a real codebase.

## 4. Agents preserve compatibility paths inside codebases they fully own

This is probably the most frustrating one, because it is where you can feel the model choosing not to pay the actual cost of the change.

An internal function changes shape, or a module has clearly drifted away from the right owner, and instead of updating all the callers the model adds one more shim. Sometimes it is an overload. Sometimes it is a default parameter kept alive for the old call sites. Sometimes it is a thin wrapper with the old name. Sometimes it is a second helper that exists only so nobody has to touch the previous layer.

There are obviously times where compatibility paths are real work you actually need to do. Public APIs, published packages, migrations with phased rollouts, protocol boundaries, weak tests, all of that is real.

But inside a private codebase where you own the callers, a lot of these compatibility seams are just debt being deferred under the label of safety.

That is the other thing I had to learn to say more explicitly: when I decide not to rewrite a churned module or not to update every caller in one pass, that does not mean the old structure is suddenly good. It usually just means my confidence is weak. That is an important distinction, because otherwise the bridge starts pretending to be architecture and nobody ever comes back to remove it.

## So what should we do instead?

For me the practical goal is not perfection or total command of every line in the codebase. That is not realistic once the amount of code being generated gets large enough. The practical goal is to use patterns that make future refactors come out with smaller diffs, simpler code, and more readable modules when we ask the agent to change something.

That means pushing for a different set of instincts than the defaults.

Preserve contracts, not obsolete helper splits.

Prefer one canonical internal shape inside a feature instead of accumulating local variants of the same thing.

Update callers instead of leaving compatibility shims behind in private code.

Delete wrapper functions and translation helpers that only rename or forward data.

Let internal contracts stay strong instead of surrounding every hop with defensive error machinery.

And maybe the biggest one: once a module has drifted far enough away from the thing it really does, stop trying to improve it one helper at a time and just rewrite the module around the current truth while keeping the outside stable.

I think this is one of the places where the old advice really changed in practice. Historically we were trained to treat rewrites as dangerous and refactors as virtuous, and at the system level I still mostly agree with that. Big-bang rewrites are still usually a mistake. But at the module level, once code generation is basically instant, rewriting one churned file or subsystem around the current truth is often cheaper and safer than preserving the old decomposition through one more "safe" refactor.

What I want from the agent is not "make this look cleaner." I want something more like:

```text
Keep the exported API the same.
Ignore the current helper split.
Rewrite this module so the flow is direct.
Delete types and wrappers that only rename data.
Update callers instead of preserving the old path.
```

And if the change is important enough, I want the model to separate the stable behavior from the disposable structure before it edits anything:

```text
Before editing:

1. List the contracts that must stay stable.
2. List the helpers, wrappers, and types that should be deleted.
3. Name the one main internal shape after the rewrite.
4. List the tests to add or tighten first.
5. Say whether this is safe to rewrite as one module. If not, say why not.

Then do one rewrite of the module, not a helper-by-helper refactor.
```

That changes the result more than people think, because it forces the model to stop treating every existing layer as sacred.

My own cleanup loop is pretty boring at this point. First I try to preserve whatever real contract or observable behavior actually matters. Then I try to collapse the feature back down to one honest internal shape. Then I do one more pass whose entire job is deletion, because agents are much better at adding the replacement than removing the corpse.

I do not think the lesson here is that coding agents are useless or that clean code no longer matters. I think the lesson is almost the opposite. Clean code matters more now, because code generation got cheap and structural dishonesty spreads fast. The defaults that produce working diffs are not the same defaults that produce maintainable systems.

That is why I keep coming back to the Amazon story. The deepest fear people have around AI slop is not really that the models will produce a bad diff today. It is that they will help us build the same kind of dead, overgrown, nobody-really-knows-what-this-is-anymore system that large organizations used to produce slowly, except now we can do it in a fraction of the time and with much better syntax.

That is what I mean by AI slop.

It is the same old structural dishonesty, just generated at the speed of light.
