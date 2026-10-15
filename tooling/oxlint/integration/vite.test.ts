import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { stripVTControlCharacters } from 'node:util';

const installer = fileURLToPath(new URL('../../../skills/oxlint-maintainability/scripts/install.mjs', import.meta.url));

interface CommandResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

interface LintReport {
  diagnostics: { code: string; filename: string; severity: string }[];
  number_of_files: number;
}

test('installed presets work with the real Vite+ lint, check, and config types', { timeout: 300_000 }, async t => {
  const directory = mkdtempSync(join(tmpdir(), 'maintainable-vite-integration-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  function run(command: string, args: string[], timeout = 60_000): Promise<CommandResult> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: directory,
        stdio: ['ignore', 'pipe', 'pipe'],
        signal: t.signal,
        timeout,
      });
      let stdout = '';
      let stderr = '';
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', chunk => { stdout += chunk; });
      child.stderr.on('data', chunk => { stderr += chunk; });
      child.on('error', reject);
      child.on('close', (status, signal) => {
        if (signal !== null) {
          reject(new Error(`${command} ${args.join(' ')} exited with ${signal}\n${stdout}\n${stderr}`));
        } else {
          resolve({ status, stdout, stderr });
        }
      });
    });
  }

  writeFileSync(join(directory, 'package.json'), JSON.stringify({
    name: 'maintainable-vite-integration',
    private: true,
    type: 'module',
    packageManager: 'pnpm@10.33.0',
    devDependencies: {
      'vite-plus': '1.2.0',
      '@oxlint/plugins': '1.88.0',
      typescript: '7.0.2',
    },
  }));
  const dependencies = await run('pnpm', ['install', '--ignore-scripts', '--no-frozen-lockfile', '--store-dir', join(directory, 'pnpm-store')], 180_000);
  assert.equal(dependencies.status, 0, `${dependencies.stdout}\n${dependencies.stderr}`);
  for (const [name, version] of [['vite-plus', '1.2.0'], ['@oxlint/plugins', '1.88.0'], ['typescript', '7.0.2']]) {
    const manifest: { version: string } = JSON.parse(readFileSync(join(directory, 'node_modules', name, 'package.json'), 'utf8'));
    assert.equal(manifest.version, version, name);
  }
  const versions = await run('pnpm', ['exec', 'vp', '--version']);
  assert.equal(versions.status, 0, versions.stderr);
  assert.match(versions.stdout, /oxlint\s+v1\.88\.0\b/);
  assert.match(versions.stdout, /oxlint-tsgolint\s+v7\.0\.2004\b/);
  t.diagnostic(`Node ${process.version}; Vite+ 1.2.0; Oxlint/plugins 1.88.0; tsgolint 7.0.2004; TypeScript 7.0.2`);

  const destination = 'config/lint/maintainable';
  const install = await run(process.execPath, [installer, '--vite', destination]);
  assert.equal(install.status, 0, `${install.stdout}\n${install.stderr}`);
  assert.ok(install.stdout.includes(`./${destination}/vite.ts`), install.stdout);

  mkdirSync(join(directory, 'src'));
  writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      strict: true,
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      allowImportingTsExtensions: true,
      skipLibCheck: true,
      noEmit: true,
    },
    include: ['vite.config.ts', 'src/**/*.ts'],
  }));
  writeFileSync(join(directory, 'src/index.ts'), `
    export interface Installation { installationId: string; archivedAt?: string; }
    export function installationLabel(installation: Installation) {
      if (installation.archivedAt !== undefined) return 'Archived: ' + installation.installationId;
      return installation.installationId;
    }
  `);
  writeFileSync(join(directory, 'src/reexports.ts'), "export { installationLabel } from './index';\n");
  writeFileSync(join(directory, 'src/types.d.ts'), "declare module 'next/navigation' { export function redirect(path: string): never; }\n");
  writeFileSync(join(directory, 'src/stack.ts'), "import { redirect } from 'next/navigation'; redirect('/installations');\n");
  writeFileSync(join(directory, 'src/conditions.ts'), `
    declare function loadInstallation(): Promise<void>;
    loadInstallation();
    export function installationId(installation: { installationId: string }) {
      if (!installation) return 'Missing';
      return installation.installationId;
    }
  `);
  writeFileSync(join(directory, destination, 'ignored.ts'), "export { installationLabel } from '../../../src/index';\n");

  for (const allPresets of [false, true]) {
    const mode = allPresets ? 'default + stack + type-aware' : 'default';
    writeFileSync(join(directory, 'vite.config.ts'), `
      import { defineConfig } from 'vite-plus';
      import maintainable from './${destination}/vite.ts';
      ${allPresets ? `import stack from './${destination}/vite-stack.ts';
      import typeAware from './${destination}/vite-type-aware.ts';` : ''}
      export default defineConfig({
        lint: {
          extends: [maintainable${allPresets ? ', stack, typeAware' : ''}],
          ignorePatterns: ['${destination}/**'],
          ${allPresets ? 'options: { typeAware: true, typeCheck: true },' : ''}
        },
        fmt: { ignorePatterns: ['${destination}/**'] },
      });
    `);
    const types = await run('pnpm', ['exec', 'tsc', '--noEmit']);
    assert.equal(types.status, 0, `${mode}: strict config types\n${types.stdout}\n${types.stderr}`);

    const invalidPaths = allPresets ? ['src'] : ['src/reexports.ts'];
    const expected = [
      'maintainable(no-re-exports)',
      ...(allPresets ? ['eslint(no-restricted-imports)', 'typescript(no-floating-promises)', 'typescript(no-unnecessary-condition)'] : []),
    ].sort();
    const invalidLint = await run('pnpm', ['exec', 'vp', 'lint', ...invalidPaths, '--format', 'json']);
    assert.equal(invalidLint.status, 1, `${mode}\n${invalidLint.stdout}\n${invalidLint.stderr}`);
    const invalidReport: LintReport = JSON.parse(invalidLint.stdout);
    assert.deepEqual(invalidReport.diagnostics.map(diagnostic => diagnostic.code).sort(), expected, mode);
    assert.equal(invalidReport.diagnostics.filter(diagnostic => diagnostic.severity === 'error').length, allPresets ? 3 : 1, mode);

    const invalidCheck = await run('pnpm', ['exec', 'vp', 'check', '--no-fmt', ...invalidPaths]);
    assert.equal(invalidCheck.status, 1, `${mode}\n${invalidCheck.stdout}\n${invalidCheck.stderr}`);
    const checkOutput = stripVTControlCharacters(`${invalidCheck.stdout}\n${invalidCheck.stderr}`);
    assert.deepEqual([...checkOutput.matchAll(/\b(?:maintainable|eslint|typescript)\([^)]+\)/g)].map(match => match[0]).sort(), expected, `${mode}\n${checkOutput}`);

    const validLint = await run('pnpm', ['exec', 'vp', 'lint', 'src/index.ts', destination, '--format', 'json']);
    assert.equal(validLint.status, 0, `${mode}\n${validLint.stdout}\n${validLint.stderr}`);
    const validReport: LintReport = JSON.parse(validLint.stdout);
    assert.deepEqual(validReport.diagnostics, [], mode);
    assert.equal(validReport.number_of_files, 1, `${mode}: installed assets must remain ignored`);
    const validCheck = await run('pnpm', ['exec', 'vp', 'check', '--no-fmt', 'src/index.ts']);
    assert.equal(validCheck.status, 0, `${mode}\n${validCheck.stdout}\n${validCheck.stderr}`);
  }
});
