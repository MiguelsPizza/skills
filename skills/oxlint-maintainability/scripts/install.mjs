#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.length > 1 || args.some((argument) => argument.startsWith('--'))) {
  console.error('Usage: node install.mjs [plugin-destination]');
  process.exit(1);
}

const source = fileURLToPath(new URL('../assets/maintainable', import.meta.url));
const destination = resolve(args[0] ?? 'tools/oxlint/maintainable');
if (existsSync(destination)) {
  console.error(`Refusing to overwrite ${destination}. Compare the existing plugin before replacing it.`);
  process.exit(1);
}

mkdirSync(dirname(destination), { recursive: true });
cpSync(source, destination, { recursive: true, force: false, errorOnExist: true });
const config = `./${relative(process.cwd(), destination).split('\\').join('/')}/config.json`;
console.log(`Copied maintainability rules to ${destination}`);
console.log(`Merge this preset into your existing Oxlint configuration: ${JSON.stringify({ extends: [config] })}`);
console.log('For Vite+, merge it into lint.extends in vite.config.ts. See the skill for optional stack and type-aware add-ons.');
