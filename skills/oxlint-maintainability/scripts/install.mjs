#!/usr/bin/env node

import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const vite = args.includes('--vite');
const paths = args.filter(argument => argument !== '--vite');
if (paths.length > 1 || args.length - paths.length > 1 || paths.some(argument => argument.startsWith('--'))) {
  console.error('Usage: node install.mjs [--vite] [plugin-destination]');
  process.exit(1);
}

const source = fileURLToPath(new URL('../assets/maintainable', import.meta.url));
const destination = resolve(paths[0] ?? 'tools/oxlint/maintainable');
let reserved = false;
try {
  mkdirSync(dirname(destination), { recursive: true });
  mkdirSync(destination);
  reserved = true;
  cpSync(source, destination, { recursive: true, force: false, errorOnExist: true });
  if (vite) {
    for (const [preset, module] of [['config', 'vite'], ['stack', 'vite-stack'], ['type-aware', 'vite-type-aware']]) {
      const config = JSON.parse(readFileSync(resolve(destination, `${preset}.json`), 'utf8'));
      let literal = JSON.stringify(config, null, 2);
      // Vite+ needs literal object presets; resolve plugin paths from the installed module.
      for (const plugin of config.jsPlugins ?? []) {
        const specifier = JSON.stringify(plugin.specifier);
        literal = literal.replace(`"specifier": ${specifier}`, `"specifier": import.meta.resolve(${specifier})`);
      }
      writeFileSync(resolve(destination, `${module}.ts`), `export default ${literal} satisfies import('vite-plus/lint').OxlintConfig;\n`);
    }
  }
} catch (error) {
  if (reserved) rmSync(destination, { recursive: true, force: true });
  if (error.code === 'EEXIST' && !reserved) {
    console.error(`Refusing to overwrite ${destination}. Compare the existing plugin before replacing it.`);
  } else {
    console.error(`Could not install ${destination}: ${error.message}`);
  }
  process.exit(1);
}
const config = `./${relative(process.cwd(), destination).split('\\').join('/')}/config.json`;
console.log(`Copied maintainability rules to ${destination}`);
if (vite) {
  console.log(`Import ${JSON.stringify(config.replace(/config\.json$/, 'vite.ts'))} and add the object to lint.extends in vite.config.ts.`);
} else {
  console.log(`Merge this preset into your existing Oxlint configuration: ${JSON.stringify({ extends: [config] })}`);
}
console.log('See the skill for optional stack and type-aware add-ons.');
