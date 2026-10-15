# Maintainability Enforcement Coverage

This is the enforcement map for [Maintainable TypeScript](https://github.com/MiguelsPizza/skills/tree/main/skills/maintainable-typescript). Doctrine remains authoritative. Syntax checks report only the evidence they can establish.

## Default Preset

| Doctrine | Executable check | Contract and limits |
| --- | --- | --- |
| No re-exports; remove compatibility exports | `maintainable/no-re-exports` — error | Blocks named, wildcard, namespace, type, and default forwarding; imported bindings; unchanged local aliases and namespace members; pure non-generic type aliases/import types; static global require/import bindings; TypeScript import/export assignments. Local declarations and local export lists are valid, including in `index.ts`. No filename ban. Defaults and rest copies create local behavior. Reassigned aliases, dynamic specifiers, CommonJS assignment exports, and cross-file inference remain outside its scope. |
| No type casts; resolve contracts at the source | Native `typescript/consistent-type-assertions` — error, `assertionStyle: "never"` | Blocks `as` and angle-bracket casts. Allows `as const` and `satisfies`. A safety comment does not authorize a cast. |
| Do not fabricate type evidence | Native `typescript/no-explicit-any`, `typescript/no-non-null-assertion` — error | Rejects explicit escape hatches; does not prove boundary parsing or runtime guarantees. |
| Explain necessary compiler exceptions | Native `typescript/ban-ts-comment` — error | Rejects `ts-ignore` and `ts-nocheck`; permits `ts-expect-error` only with a description. TypeScript still checks that an expected error actually exists. |
| No defensive catches | Native `no-empty`, `no-useless-catch` — error | Detects empty blocks and catch-only rethrows. Meaningful recovery, cleanup, and translation remain valid. Logging-only catches, swallowed defaults, and the quality of recovery still need review; a comment can exempt an empty block from the native rule. |
| Mock external boundaries only | `maintainable/no-internal-module-mocking` — error | Recognizes global/imported/aliased/namespace Vitest and Jest module mocks, including static template and dynamic-import arguments. Allows external SDK packages and shadowed local APIs. Configure bare workspace package names. Dynamic specifiers and internal spies still need review. |
| Delete fake layers; deepen modules; edit real owners; reject compatibility wrappers | `maintainable/no-trivial-forwarding-wrapper` — warn | Flags named functions, bound arrows/functions, and methods whose sole call forwards all parameters unchanged, including transparent await/rest forwarding. Skips default parameters, changed arguments, nested callee calls, generators, decorated methods, and multi-statement policy/lifecycle bodies. Named framework adapters can warn: review and suppress with a reason. Does not count callers or prove a function is disposable. |
| Pass owned internal values; SSOT; use canonical named types | `maintainable/no-internal-shape-churn` — warn | Flags unshadowed built-in `Pick`/`Omit`, same-field projection helpers, and flat destructure/rest-return helpers. Does not flag Zod `.pick()`/`.omit()`, immutable updates, React props, or guarded property-presence construction. A real wire/public contract may justify a finding. It cannot decide internal ownership. |
| Delete obsolete code; clean up touched code | Oxlint's native correctness defaults; TypeScript; Fallow | Native defaults find local unused/unreachable code. Fallow owns unused files, exports, dependencies, cycles, duplication, and project reachability. This preset does not replace those graph checks. |

The custom rules use AST and lexical scope APIs. They do not have a TypeScript checker, resolve every runtime alias, or infer imported signatures. Module mocks recognize direct ESM import aliases and namespaces; copied framework handles such as `const tests = vi` and CommonJS framework imports still need review. Wrapper and projection warnings deliberately avoid automatic rewrites.

## Optional Type-Aware Preset

Run with `options.typeAware: true` or `--type-aware`; merely extending the file does not activate these rules.

| Doctrine | Native rule | Contract and limits |
| --- | --- | --- |
| No defensive null checks; internals trust validated contracts | `typescript/no-unnecessary-condition` — warn | Finds conditions that strict TypeScript considers redundant. Optional values and genuine runtime boundaries stay meaningful. Accurate declarations are required; a declared type alone is not runtime evidence. |
| Validate boundaries; preserve truthful contracts | `typescript/no-unsafe-assignment`, `no-unsafe-argument`, `no-unsafe-call`, `no-unsafe-member-access`, `no-unsafe-return` — error | Prevents unchecked `any` from flowing into trusted code. Keeping raw input as `unknown` is valid. These rules do not require a particular schema library or prove validation happened at the correct edge. |
| Own asynchronous work | `typescript/no-floating-promises` — error | Finds unhandled promise expressions. Explicit discards, framework lifetime, cancellation, retry budgets, queue limits, and payload limits still require review. |

Build or otherwise resolve workspace declarations before using type-aware checks. Keep the project's existing type-check command.

## Optional House Stack Preset

| Doctrine | Native rule | Contract and limits |
| --- | --- | --- |
| Do not choose Next.js for the house SPA stack | `no-restricted-imports` — error | Restricts `next` and its subpaths. An intentionally chosen exception needs a file override. This does not inspect manifests, dynamic imports, or framework configuration. |
| Test React apps in real browsers | `no-restricted-imports` — error | Restricts `jsdom` and `happy-dom` imports. Vitest environment strings, chosen test lanes, and mounting real routes still need review and actual browser tests. |
| Do not synchronize application state with useEffect | `react/set-state-in-effect` — error | Detects synchronous state setters in effects. External connection/cleanup effects remain valid. Does not ban all effect imports or prove state belongs to Router, Query, or render. |
| Log at boundaries; use established telemetry | `no-console` — warn | Finds console calls. Configure boundary/CLI overrides. Does not validate logger event names, duplicate logs, redaction, or OpenTelemetry attributes. |
| Name behavioral constants | `no-magic-numbers` — warn | Numeric subset only; permits -1/0/1 identities, array/type indexes, and numeric literal types. Does not infer business meaning, validate provenance, or find behavioral string literals. |

The stack preset is opt-in. It must not impose a SPA choice on a library, an existing Next.js product, or a WebMCP integration task.

The numeric rule leaves object-property literals unchecked so named constant records remain valid. Review inline option objects and provenance separately.

## Rules Requiring Project Configuration or Review

| Sections | Correct enforcement surface |
| --- | --- |
| Feature ownership, monorepo/package boundaries, naming/navigation, deep modules, composable primitives, functional core, class/service structure, builders | Fallow boundaries, the existing fake-layer detector, and review of callers/ownership. Local wrapper warnings provide candidates, not architecture proofs. |
| Minimal schemas, derived Zod schemas, schema-owned errors, OpenAPI inference, canonical types, branded scalars, contract-gated synthetic fixtures | TypeScript, schema/contract tests, and review of canonical owners. Lint cannot prove that a second schema or type is truthful. Pick/Omit warnings cover only a syntactic subset. |
| Boundary parsing, defensive null checks, error UX, cache invalidation, bounded behavior | Type-aware checks plus integration tests and review of trust, runtime absence, meaningful recovery, lifecycle, and limits. Do not ban every `typeof`, `unknown`, null check, or catch: boundaries need them. |
| Integration-first tests, observable outcomes, external mocks, artifact-based AI tests | Real integration/browser tests and review of assertions and fixtures. Internal module mocks are enforced; spies, choreography assertions, and fixture provenance require context. |
| Mature dependencies, catalog dependencies, toolchain consistency, generated migrations | Fallow/dependency policy, workspace catalogs, migration generation checks, and review. Do not invent generic AST rules for package-manager or database state. |
| Design-system components/tokens, comments/JSDoc/provenance, telemetry conventions | Repository-specific lint restrictions when names/paths/tokens are known, plus review. A generic color or comment ban would reject legitimate design-system owners and informative documentation. |
| Maintainability equals correctness, atomic changes, commit rationale, copied patterns, agent-era writing | Review and repository workflow. These are behaviors of a change or agent, not a reliable local AST predicate. |
| Every WebMCP Designer section | Tool schema/runtime checks and integration tests plus review of read/write/navigation semantics, staged actions, scope, authorization, and human-facing flows. Thin framework/tool adapters can be legitimate. |

Keep these rules in the skills. Moving syntactic checks into Oxlint does not delete the judgment they cannot provide.

## Test Evidence and Source

The suites exercise the shipped source through Oxlint's `RuleTester`, native/type-aware presets through the real CLI, and an installed copy through a fresh consumer configuration. Fixtures include the existing doctrine's `createRepositoryInstallation` forwarding example, package export forms, validation/authorization/lifecycle wrappers, real schema derivation patterns, and legitimate external test boundaries.

The implementation and copy-to-repository delivery follow [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop/tree/13909c9e07590f5a85d93c62712259fe14a883f7). Incompatible policies are deliberately excluded: this doctrine permits external SDK mocks, unknown boundary input, boundary narrowing, and real schema projections. See [UPSTREAM.md](../assets/maintainable/UPSTREAM.md) for attribution.
