import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const installer = fileURLToPath(new URL('../../../skills/oxlint-maintainability/scripts/install.mjs', import.meta.url));
const modules = fileURLToPath(new URL('../../../node_modules', import.meta.url));
const oxlint = join(modules, 'oxlint/bin/oxlint');

interface Diagnostic {
  code: string;
  filename: string;
}

test('a consumer composes every preset at a custom destination without losing project policy', () => {
  const directory = mkdtempSync(join(tmpdir(), 'maintainable-composed-consumer-'));
  try {
    symlinkSync(modules, join(directory, 'node_modules'), 'dir');
    mkdirSync(join(directory, 'src'));
    mkdirSync(join(directory, 'build'));
    writeFileSync(join(directory, 'package.json'), '{ "type": "module" }');
    writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { strict: true, target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler' },
      include: ['src/**/*.ts'],
    }));
    const original = { rules: { eqeqeq: 'error' }, ignorePatterns: ['build/**'] };
    const configPath = join(directory, '.oxlintrc.json');
    writeFileSync(configPath, JSON.stringify(original));
    const destination = 'config/lint/maintainable';
    const install = spawnSync(process.execPath, [installer, destination], { cwd: directory, encoding: 'utf8' });
    assert.equal(install.status, 0, install.stderr);
    assert.deepEqual(JSON.parse(readFileSync(configPath, 'utf8')), original);
    assert.ok(install.stdout.includes(`./${destination}/config.json`), install.stdout);

    writeFileSync(configPath, JSON.stringify({
      ...original,
      extends: ['config.json', 'stack.json', 'type-aware.json'].map(preset => `./${destination}/${preset}`),
      options: { typeAware: true },
      ignorePatterns: [...original.ignorePatterns, `${destination}/**`],
      rules: {
        ...original.rules,
        'maintainable/no-internal-module-mocking': ['error', { internalModulePrefixes: ['@acme/'] }],
      },
      overrides: [{
        files: ['src/sandbox.test.ts'],
        rules: { 'maintainable/no-internal-module-mocking': ['error', { internalModulePrefixes: ['@vendor/'] }] },
      }],
    }));
    writeFileSync(join(directory, 'src/types.d.ts'), `
      declare module 'vitest' { export const vi: { mock(specifier: string): void }; }
      declare module 'next/navigation' { export function redirect(path: string): never; }
    `);
    writeFileSync(join(directory, 'src/index.ts'), `
      export interface Installation { installationId: string; archivedAt?: string; }
      declare const installationSchema: {
        pick(fields: { installationId: true }): { parse(input: unknown): { installationId: string } };
      };
      export const installationInputSchema = installationSchema.pick({ installationId: true });
      export function createInstallationPayload(installation: Installation) {
        const payload: { installationId: string; archivedAt?: string } = { installationId: installation.installationId };
        if (installation.archivedAt !== undefined) payload.archivedAt = installation.archivedAt;
        return payload;
      }
      export function installationLabel(installation: Installation | undefined) {
        if (!installation) return 'Missing installation';
        return installation.installationId;
      }
      declare function loadRepositoryPage(args: { installationId: string }): Promise<Installation>;
      // oxlint-disable-next-line maintainable/no-trivial-forwarding-wrapper -- framework requires this named loader entrypoint
      export async function loader(args: { installationId: string }) {
        return loadRepositoryPage(args);
      }
    `);
    writeFileSync(join(directory, 'src/external.test.ts'), `
      import { vi } from 'vitest';
      vi.mock('@aws-sdk/client-s3');
      vi.mock('@acmeish/transport');
    `);
    writeFileSync(join(directory, 'src/internal.test.ts'), `
      import { vi as testApi } from 'vitest';
      testApi.mock('@acme/domain');
      testApi.mock('./index');
    `);
    writeFileSync(join(directory, 'src/sandbox.test.ts'), `
      import { vi } from 'vitest';
      vi.mock('@acme/domain');
      vi.mock('@vendor/transport');
    `);
    writeFileSync(join(directory, 'src/reexports.ts'), "export { installationInputSchema } from './index';\n");
    writeFileSync(join(directory, 'src/stack.ts'), "import { redirect } from 'next/navigation'; redirect('/installations');\n");
    writeFileSync(join(directory, 'src/conditions.ts'), `
      export function installationLabel(installation: { installationId: string }) {
        if (!installation) return 'Missing installation';
        return installation.installationId;
      }
      export function isEnabled(value: number | undefined) { return value == 1; }
      declare function saveInstallation(): Promise<void>;
      saveInstallation();
    `);
    writeFileSync(join(directory, 'build/generated.ts'), "export const invalid = JSON.parse('{}') as any;\n");

    const run = (paths: string[]) => {
      const result = spawnSync(process.execPath, [oxlint, '-c', '.oxlintrc.json', '--format', 'json', ...paths], {
        cwd: directory,
        encoding: 'utf8',
        env: { ...process.env, PATH: `${join(modules, '.bin')}${delimiter}${process.env.PATH}` },
      });
      assert.ifError(result.error);
      assert.ok(result.stdout.trim().startsWith('{'), `${result.stdout}\n${result.stderr}`);
      const report: { diagnostics: Diagnostic[] } = JSON.parse(result.stdout);
      return { status: result.status, diagnostics: report.diagnostics };
    };
    const result = run(['src', 'build']);
    assert.equal(result.status, 1);
    const diagnosticsFor = (filename: string) => result.diagnostics.filter(diagnostic => diagnostic.filename.endsWith(filename));
    assert.deepEqual(diagnosticsFor('src/index.ts'), [], 'local index declarations, schema picks, optional checks, presence branches, and the explained framework wrapper stay valid');
    assert.deepEqual(diagnosticsFor('src/external.test.ts'), [], 'external SDK mocks remain valid');
    assert.deepEqual(diagnosticsFor('build/generated.ts'), [], 'existing generated-file ignore remains active');
    assert.equal(diagnosticsFor('src/internal.test.ts').filter(diagnostic => diagnostic.code.includes('no-internal-module-mocking')).length, 2);
    assert.equal(diagnosticsFor('src/sandbox.test.ts').filter(diagnostic => diagnostic.code.includes('no-internal-module-mocking')).length, 1);
    for (const [filename, rule] of [
      ['src/reexports.ts', 'no-re-exports'],
      ['src/stack.ts', 'no-restricted-imports'],
      ['src/conditions.ts', 'eqeqeq'],
      ['src/conditions.ts', 'no-floating-promises'],
      ['src/conditions.ts', 'no-unnecessary-condition'],
    ] as const) {
      assert.ok(diagnosticsFor(filename).some(diagnostic => diagnostic.code.includes(rule)), `${filename}: ${rule}`);
    }

    const valid = run(['src/index.ts', 'src/external.test.ts']);
    assert.equal(valid.status, 0);
    assert.deepEqual(valid.diagnostics, []);

    const installedRulePath = join(directory, destination, 'rules/no-re-exports.ts');
    const changedRule = `${readFileSync(installedRulePath, 'utf8')}\n// Consumer-maintained exception.\n`;
    writeFileSync(installedRulePath, changedRule);
    const rerun = spawnSync(process.execPath, [installer, destination], { cwd: directory, encoding: 'utf8' });
    assert.equal(rerun.status, 1);
    assert.match(rerun.stderr, /Refusing to overwrite/);
    assert.equal(readFileSync(installedRulePath, 'utf8'), changedRule);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
