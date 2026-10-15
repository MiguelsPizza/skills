---
name: oxlint-maintainability
description: Install, configure, and extend Oxlint enforcement for TypeScript maintainability doctrine. Use for executable re-export, type-safety, mocking, forwarding-wrapper, and shape-churn checks, including Vite+ projects.
license: MIT
---

# Enforce TypeScript Maintainability with Oxlint

Install the bundled plugin and presets into the target repository. Use native Oxlint rules where they already express the doctrine. Read [coverage.md](references/coverage.md) for the exact checks, allowed cases, and behaviors that still need review or project-wide tools.

## Install

1. Read the target repository's instructions, status, package manager, lint config, path aliases, and workspace package names. Preserve existing rules, ignores, overrides, and unrelated edits.
2. Copy the assets from the target repository root:

   ```sh
   node <skill-directory>/scripts/install.mjs
   ```

   This creates `tools/oxlint/maintainable/`. An optional first argument changes that destination. The installer refuses to overwrite existing files. For an upgrade, compare the installed copy with this skill before replacing it.
3. Use the existing toolchain. These assets are tested with Oxlint and `@oxlint/plugins` **1.88.0**, Node **22**, and `oxlint-tsgolint` **7.0.2004**. For standalone Oxlint, install compatible `oxlint` and matching `@oxlint/plugins` development dependencies with the repository's package manager. For Vite+, use its bundled Oxlint and add only the compatible plugin dependency; update Vite+ if its Oxlint is too old. Check installed versions rather than silently adding a second linter.
4. Merge the preset into the existing configuration. For `.oxlintrc.json`:

   ```json
   {
     "extends": ["./tools/oxlint/maintainable/config.json"],
     "ignorePatterns": ["tools/oxlint/maintainable/**"]
   }
   ```

   For Vite+, merge into the root `vite.config.ts`:

   ```ts
   import { defineConfig } from 'vite-plus';

   export default defineConfig({
     lint: {
       extends: ['./tools/oxlint/maintainable/config.json'],
       ignorePatterns: ['tools/oxlint/maintainable/**'],
     },
     fmt: { ignorePatterns: ['tools/oxlint/maintainable/**'] },
   });
   ```

   Keep all existing entries. Adjust paths for a custom destination. Ignore installed agent assets and generated code according to the repository's existing policy. Oxlint resolves the preset's plugin path relative to the preset itself.
5. Configure `maintainable/no-internal-module-mocking` with the repository's actual internal module prefixes. Defaults cover relative/absolute paths, `@/`, `~/`, `#`, and `@repo/`. Other bare workspace packages require explicit prefixes:

   ```json
   {
     "rules": {
       "maintainable/no-internal-module-mocking": ["error", {
         "internalModulePrefixes": ["@/", "~/", "#", "@repo/", "@workspace/", "shared-contracts"]
       }]
     }
   }
   ```

   This option replaces the default prefix list; relative and absolute paths remain internal. A package name matches itself and its subpaths. A trailing slash matches that scope or alias prefix.
6. Run `vp lint` or the existing Oxlint command. Errors are enforced contracts. Review every wrapper/shape warning against its owning doctrine. Delete fake layers; preserve real validation, authorization, lifecycle, transformation, and public contracts.

## Optional Presets

Append [stack.json](assets/maintainable/stack.json) to the same `extends` array only for the house SPA stack. It restricts Next.js and simulated DOM imports, rejects synchronous state mirroring in effects, and warns about console output and numeric behavior literals. Merge existing `no-restricted-imports` restrictions if the target already configures that rule; later rule options replace earlier options.

Append [type-aware.json](assets/maintainable/type-aware.json) only when the repository can run type-aware Oxlint. Install a compatible `oxlint-tsgolint` for standalone Oxlint, then enable `options: { typeAware: true }` in the root config (or run `oxlint --type-aware`). Vite+ uses the same root `lint.options` setting and its own toolchain. Ensure strict TypeScript configuration and resolvable workspace declarations.

These files are add-ons: keep `config.json` in `extends` too. Loading the type-aware rule list alone does not turn on type analysis.

## Exceptions

Use a narrow path override for an established boundary or generated surface. For a single review finding, record why the layer earns its existence:

```ts
// oxlint-disable-next-line maintainable/no-trivial-forwarding-wrapper -- framework requires this named loader entrypoint
export async function loader(args: LoaderArgs) {
  return loadRepositoryPage(args);
}
```

These detectors have no autofixes. Inspect semantics before removing wrappers or changing object presence. Do not promote review warnings to errors without reviewing existing findings and configuring boundaries. A clean lint run does not prove that schemas, trust boundaries, browser tests, or architecture are correct.

## Extend with TDD

Follow the source/test layout and real `RuleTester` usage in [anti-slop](https://github.com/dmmulroy/anti-slop). Its implementation style informed this plugin; its policies are not enabled wholesale.

Start with a real violating snippet from the target repository. Add one failing test through Oxlint's public `RuleTester` or CLI, implement the smallest detector, then add one realistic allowed or ambiguous case at a time. Use lexical scope information when identifiers can be shadowed. Test two files in one lint run when keeping per-file state.

The canonical shipped source is [assets/maintainable/](assets/maintainable/); edit it directly. Keep tests outside that directory so installed copies contain only runtime assets. In this repository, `pnpm check` runs the RuleTester/consumer CLI suites, TypeScript, self-lint, and document checks. Rebuild the skill ZIP after changes.

Sources: [Oxlint JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins), [writing rules and RuleTester](https://oxc.rs/docs/guide/usage/linter/writing-js-plugins), [type-aware configuration](https://oxc.rs/docs/guide/usage/linter/type-aware.html), [Vite+ lint configuration](https://viteplus.dev/config/lint).
