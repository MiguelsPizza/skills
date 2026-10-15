# Maintainability Enforcement Coverage

These checks enforce parts of [Maintainable TypeScript](https://github.com/MiguelsPizza/skills/tree/main/skills/maintainable-typescript). Use the linked doctrine to review findings that depend on context.

## Default Preset

| Doctrine | Executable check | Contract and limits |
| --- | --- | --- |
| No re-exports | `maintainable/no-re-exports` — error | Rejects export-from, type/default forwarding, imported bindings, namespace members, unchanged aliases, non-generic type aliases/import types, static require/import bindings, and TypeScript import/export assignments. Allows local declarations and export lists, including in `index.ts`, plus defaults and rest copies. Skips reassigned aliases, dynamic specifiers, CommonJS assignment exports, and cross-file inference. |
| No type casts | Native `typescript/consistent-type-assertions` — error, `assertionStyle: "never"` | Rejects `as` and angle-bracket casts. Allows `as const` and `satisfies`. |
| Keep truthful types | Native `typescript/no-explicit-any`, `typescript/no-non-null-assertion` — error | Rejects explicit `any` and non-null assertions. Review runtime guarantees at boundaries. |
| Explain compiler exceptions | Native `typescript/ban-ts-comment` — error | Rejects `ts-ignore` and `ts-nocheck`. Requires a description for `ts-expect-error`; TypeScript checks that the expected error exists. |
| No defensive catches | Native `no-empty`, `no-useless-catch` — error | Rejects empty blocks and catch-only rethrows. Allows recovery, cleanup, and translation. Review swallowed errors and defaults; comments can exempt empty blocks. |
| Mock external boundaries only | `maintainable/no-internal-module-mocking` — error | Detects Vitest/Jest module mocks through globals, ESM import aliases, and namespaces, with static strings/templates or import arguments. Allows external SDK mocks and shadowed local APIs. Configure workspace package names; review dynamic specifiers and internal spies. |
| Delete fake layers | `maintainable/no-trivial-forwarding-wrapper` — warn | Flags functions, bound arrows, and methods whose only call forwards parameters unchanged, including await/rest forwarding. Skips defaults, changed arguments, nested callee calls, generators, decorators, and multi-statement bodies. Review caller usage and intentional framework adapters before deleting. |
| Pass owned values; keep canonical types | `maintainable/no-internal-shape-churn` — warn | Flags built-in `Pick`/`Omit` unless locally redefined, same-field projection helpers, and flat destructure/rest-return helpers. Allows schema `.pick()`/`.omit()`, immutable updates, React props, and guarded property construction. Review whether a boundary or public contract justifies the narrower shape. |
| Delete obsolete code | Oxlint correctness defaults; TypeScript; Fallow | Native defaults find local unused/unreachable code. Fallow finds unused files, exports, dependencies, cycles, duplication, and project reachability. |

Custom rules inspect syntax and lexical scope. Imported signatures and runtime aliases need review, including copied mock handles (`const tests = vi`) and CommonJS framework imports. Wrapper and projection checks have no autofixes.

## Optional Type-Aware Preset

Enable `options.typeAware: true` or `--type-aware` after extending this preset.

| Doctrine | Native rule | Contract and limits |
| --- | --- | --- |
| Trust validated internal contracts | `typescript/no-unnecessary-condition` — warn | Finds conditions made redundant by strict TypeScript types. Allows optional values. Review runtime boundaries and declaration accuracy. |
| Validate boundaries | `typescript/no-unsafe-assignment`, `no-unsafe-argument`, `no-unsafe-call`, `no-unsafe-member-access`, `no-unsafe-return` — error | Blocks unchecked `any` flows. Raw input may remain `unknown` until parsed. Review where validation belongs; schema library choice is unrestricted. |
| Own asynchronous work | `typescript/no-floating-promises` — error | Finds unhandled promises. Review explicit discards, framework lifetimes, cancellation, retry budgets, queue limits, and payload limits. |

Resolve workspace declarations first, building packages if needed. Keep the existing type-check command.

## Optional House Stack Preset

| Doctrine | Native rule | Contract and limits |
| --- | --- | --- |
| Use the house SPA stack | `no-restricted-imports` — error | Restricts `next` and its subpaths. Use file overrides for approved exceptions. Review manifests, dynamic imports, and framework config. |
| Test React apps in real browsers | `no-restricted-imports` — error | Restricts `jsdom` and `happy-dom` imports. Review Vitest environment settings, test lanes, and route mounting; run browser tests. |
| Use the right state owner | `react/set-state-in-effect` — error | Rejects synchronous state setters in effects. Allows external connection/cleanup effects. Review whether state belongs to Router, Query, or render. |
| Log at boundaries | `no-console` — warn | Finds console calls. Set boundary/CLI overrides. Review event names, duplicate logs, redaction, and OpenTelemetry attributes. |
| Name behavioral constants | `no-magic-numbers` — warn | Allows -1/0/1, array/type indexes, numeric literal types, and object properties. Review inline options, behavioral strings, and constant provenance. |

Enable this preset only for the house SPA stack. Libraries, existing Next.js products, and WebMCP integrations keep their own stack choices.

## Rules Requiring Project Configuration or Review

| Sections | Correct enforcement surface |
| --- | --- |
| Feature ownership, package boundaries, naming, deep modules, composable primitives, functional core, classes, builders | Fallow boundaries, the fake-layer detector, and review of callers and ownership. |
| Minimal/derived schemas, schema-owned errors, OpenAPI inference, canonical types, brands, validated fixtures | TypeScript, schema/contract tests, and review of schema and type owners. Pick/Omit warnings cover part of this work. |
| Boundary parsing, null checks, error UX, cache invalidation, bounded behavior | Type-aware checks, integration tests, and review of trust, runtime absence, recovery, lifecycle, and limits. Boundary code may need `typeof`, `unknown`, null checks, and catches. |
| Integration tests, observable outcomes, external mocks, artifact-based AI tests | Integration/browser tests and review of assertions and fixtures. Inspect spies, call assertions, and fixture sources in context. |
| Dependencies, catalogs, toolchain consistency, generated migrations | Fallow, dependency policy, workspace catalogs, migration checks, and review. |
| Design-system components/tokens, comments/JSDoc/sources, telemetry | Repository-specific restrictions for known names, paths, and tokens; review meaning and ownership. |
| Maintainability, atomic changes, commit rationale, copied patterns, agent-era writing | Review and repository workflow. |
| WebMCP Designer | Schema/runtime checks, integration tests, and review of action semantics, staged commits, scope, authorization, and user flows. Preserve needed framework/tool adapters. |

These decisions remain in the skills for review.

## Test Evidence and Source

Tests run the shipped rules through `RuleTester`, presets through the CLI, and installed assets in a fresh consumer repository. Fixtures cover the original `createRepositoryInstallation` forwarding example, export forms, justified wrappers, schema derivation, and external mocks.

Rule structure and installation follow [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop/tree/13909c9e07590f5a85d93c62712259fe14a883f7). This skill allows external SDK mocks, unknown boundary input, boundary narrowing, and schema projections. See [UPSTREAM.md](../assets/maintainable/UPSTREAM.md) for attribution.
