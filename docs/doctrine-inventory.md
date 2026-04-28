# Doctrine Inventory

This is the working map for collapsing duplicate opinion files without turning the skill into a style-guide maze.

## Cleanup Order

1. Collapse the smallest self-contained clusters first.
2. Preserve examples only when they teach a distinct diagnostic.
3. Delete files whose main job is now covered by a sharper doctrine file.
4. Update `README.md`, `SKILL.md`, front matter `implements`, and `Example implements:` footers in the same commit.
5. Rebuild archives only after the source docs pass validation.

## Proposed Directory Shape

This is the current shape after the first structural move.

```text
skills/maintainable-typescript/
  doctrine/
    foundations/
    deletion/
    boundaries/
    abstractions/
    testing/
    packages/
    tooling/
  stack/
  prompts/
  scripts/
```

The repo now uses `doctrine/` for portable rules and `stack/` for stack-specific doctrine. Maintainable TypeScript uses subdirectories under `doctrine/`; WebMCP Designer keeps portable doctrine flat because the surface is smaller.

## Merge Clusters

| Cluster | Files | Shared Claim | Preserve | Target |
| --- | --- | --- | --- | --- |
| Builder Doctrine | `accumulate-types-with-builders`, `compose-builders-from-steps`, `do-not-use-builders-for-plain-data` | Builders are useful only when staged calls add type guarantees or capabilities. | Positive staged-builder example; negative plain-data example; step-composition warning. | Collapsed into `make-builders-earn-their-keep`. |
| Fake Structure | `delete-shape-churn`, `delete-pass-through-wrappers`, `edit-real-owners`, part of `build-deep-modules-not-shallow-abstractions` | Delete layers that rename, forward, or preserve stale ownership without adding invariants. | Keep distinct diagnostics for data-shape churn, call wrappers, and change ownership. | Collapsed shape churn and pass-through wrappers into `delete-fake-layers`; kept `edit-real-owners` and `build-deep-modules-not-shallow-abstractions`. |
| Composition And Classes | `design-around-composable-primitives`, `compose-behavior-do-not-specialize-classes`, `use-classes-for-object-apis-not-service-buckets` | Start with values/functions/modules; classes earn their place through a real object API, not service buckets or inheritance. | Preserve the inheritance warning and the legitimate class examples. | Merge to one composition rule and one narrower class rule, or one file if concise. |
| Agent-Era Rewrite Doctrine | `write-for-the-agent-era`, `clean-up-what-you-touch`, part of `no-backwards-compat-shims` | Preserve contracts and invariants, not obsolete decomposition or temporary migration scaffolding. | Keep guardrails against reckless rewrites. | Revisit after compatibility cleanup settles. |
| Clean Break / Compatibility Surface | `delete-obsolete-code`, `delete-temporary-migration-layers`, `no-backwards-compat-shims`, `no-unused-exports`, `no-re-exports`, `atomic-changes` | Update callers and remove old internal paths in the same logical change. | Keep `atomic-changes` as PR-shape doctrine and `no-re-exports` as import-surface doctrine. | Collapsed `no-unused-exports` into `no-re-exports`; folded migration scaffolding into `no-backwards-compat-shims`. |
| Future-Proofing / Speculative Design | `no-premature-abstractions`, `no-speculative-configuration`, `keep-schemas-minimal` | Do not encode imagined future cases into abstractions, config, or persisted schemas. | Keep schema minimalism distinct because persistence is harder to unwind. | Collapsed speculative configuration into `no-premature-abstractions`; kept schema minimalism distinct. |
| Boundary Data Flow | `pass-values-across-boundaries`, `boundaries-validate-internals-trust`, `no-type-casts`, part of `ssot-or-die` | Validate at boundaries, pass plain values, and keep internal types trustworthy. | These may be related but still distinct enough to keep. | Do not merge in the first pass. |
| Testing Surface | `integration-first-testing`, `external-boundary-mocks-only`, `contract-gate-synthetic-fixtures`, `assert-observable-outcomes`, `test-ai-apps-by-artifacts-not-prose` | Tests should attach regressions to durable product and contract surfaces. | Keep separate unless examples repeat heavily. | Later review. |
| Comments / Provenance | `comments-say-why-not-what`, `jsdoc-with-first-party-sources` | Comments must add non-obvious information at the owning surface. | Keep portable comment discipline separate from stack-specific provenance/JSDoc policy. | Keep both; tighten naming later. |
| Error / Logging / Observability | `error-messages-are-ux`, `log-at-boundaries-not-everywhere`, `otel-conventions-from-day-one`, `errors-are-schema`, `no-defensive-catches` | Errors and logs are boundary contracts with distinct audiences. | Keep API error schemas, log placement, user messages, catch policy, and OTEL naming separate. | Prune duplicate examples before deleting files. |
| WebMCP Route Surface | `route-maps-drive-discovery`, `user-stories-drive-web-skills`, `tool-descriptions-are-local-contracts` | Agent workflow guidance belongs in routes/user stories, not brittle tool-description scripts. | Distinguish route discovery, workflow docs, and local tool contracts. | Possible merge after Maintainable TypeScript cleanup. |
| WebMCP Tool Boundaries | `read-tools-live-at-data-boundaries`, `tool-types-have-clear-boundaries`, `stage-forms-then-commit`, `capabilities-over-click-targets` | Model capabilities and risk profiles, not DOM clicks or all-in-one tools. | Keep staged mutation guidance distinct if high-risk actions remain central. | Later review. |
| WebMCP Stack Blueprint | `start-here`, `module-local-webmcp-directories`, `thin-wrappers-over-existing-logic`, `implementation-patterns`, `one-pass-instrumentation-plan` | The stack directory repeats route-first, module-local wrapper, thin-adapter, read-before-write, and staged-commit doctrine. | Preserve route/feature/workflow architecture, wrapper ownership, and implementation ordering. | Collapsed module-local ownership into `start-here`; folded thin-wrapper examples into `implementation-patterns`; kept `one-pass-instrumentation-plan` as execution order. |

## First Collapse

Started with Builder Doctrine because it had few external links and a clear replacement file. The merge deleted the three old builder files, added `make-builders-earn-their-keep.md`, updated indexes, and reran the opinion/link checks.

## Remaining Validation Gaps

The first cleanup pass tightened archive rebuilding and duplicate-prose detection. These gaps still need a follow-up if this repo starts enforcing indexes more strictly:

- README/SKILL links can be valid while an opinion is missing from an index.
- Footer validation compares sets, not order, even though the contributor guide says the list should be exact.
- Front matter parsing is custom and expects the current simple YAML shape.
