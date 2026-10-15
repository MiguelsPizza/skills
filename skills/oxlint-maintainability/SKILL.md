---
name: oxlint-maintainability
description: Install and extend Oxlint rules for TypeScript maintainability, including Vite+ projects. Covers re-exports, type safety, internal mocks, forwarding wrappers, and shape churn.
license: MIT
---

# Enforce TypeScript Maintainability with Oxlint

Install the bundled plugin and presets. Use [coverage.md](references/coverage.md) to check each rule's scope and exceptions.

## Install

1. Read the repository's instructions. Check Git status, the toolchain, lint config, path aliases, and workspace names. Preserve existing config and unrelated edits.
2. Copy the assets from the target repository root:

   ```sh
   node <skill-directory>/scripts/install.mjs
   ```

   The default destination is `tools/oxlint/maintainable/`; pass another path as the first argument. The installer refuses to overwrite files. Compare the installed copy before upgrading.
3. Check installed versions. Tested: Node **22**, Oxlint and `@oxlint/plugins` **1.88.0**, `oxlint-tsgolint` **7.0.2004**.

   For standalone Oxlint, use the repository's package manager to add compatible `oxlint` and matching `@oxlint/plugins` dev dependencies. For Vite+, use bundled Oxlint and add a compatible plugin dependency. Upgrade Vite+ if its Oxlint is too old.
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

   Keep existing entries and adjust paths for a custom destination. Apply the repository's ignore policy to agent assets and generated code. Plugin paths resolve relative to the preset.
5. Set `maintainable/no-internal-module-mocking` prefixes for internal packages. Defaults cover relative and absolute paths, `@/`, `~/`, `#`, and `@repo/`. Add other workspace packages:

   ```json
   {
     "rules": {
       "maintainable/no-internal-module-mocking": ["error", {
         "internalModulePrefixes": ["@/", "~/", "#", "@repo/", "@workspace/", "shared-contracts"]
       }]
     }
   }
   ```

   This list replaces the default prefixes; relative and absolute paths stay internal. Package names match themselves and their subpaths. A trailing slash matches a scope or alias prefix.
6. Run `vp lint` or the repository's Oxlint command. Fix errors and review wrapper and shape warnings against their linked rules.

## Optional Presets

For the house SPA stack, append [stack.json](assets/maintainable/stack.json) to `extends`. It restricts Next.js, simulated DOM imports, and state mirroring in effects; console calls and numeric literals produce warnings. Merge any existing `no-restricted-imports` options: later options replace earlier ones.

For type-aware checks, append [type-aware.json](assets/maintainable/type-aware.json). Standalone Oxlint needs compatible `oxlint-tsgolint` and root `options: { typeAware: true }` or `--type-aware`. Vite+ uses `lint.options` and its bundled toolchain. Use strict TypeScript settings and resolve workspace declarations first.

Keep `config.json` in `extends` with either add-on. Enable type analysis separately from its rule list.

## Exceptions

Use path overrides for boundaries or generated code. Explain individual review exceptions:

```ts
// oxlint-disable-next-line maintainable/no-trivial-forwarding-wrapper -- framework requires this named loader entrypoint
export async function loader(args: LoaderArgs) {
  return loadRepositoryPage(args);
}
```

Review warnings before removing code. Keep layers that own validation, authorization, lifecycle, transformation, or a public contract. Check property-presence semantics before changing objects. These rules have no autofixes. Review findings and configure boundaries before promoting warnings to errors.

## Extend with TDD

Use [anti-slop](https://github.com/dmmulroy/anti-slop) as a reference for rule structure and `RuleTester` usage.

Start with a real violation. Write one failing `RuleTester` or CLI test, then implement the check. Add allowed and ambiguous cases one at a time. Resolve lexical scope for shadowable names. Test multiple files in one lint run if the rule stores per-file state.

Edit [assets/maintainable/](assets/maintainable/) directly; it is the shipped source. Keep tests outside that directory. Run `pnpm check` in this repository for tests, TypeScript, self-lint, and doc checks. Rebuild the ZIP after changes.

Sources: [Oxlint JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins), [writing rules and RuleTester](https://oxc.rs/docs/guide/usage/linter/writing-js-plugins), [type-aware configuration](https://oxc.rs/docs/guide/usage/linter/type-aware.html), [Vite+ lint configuration](https://viteplus.dev/config/lint).
