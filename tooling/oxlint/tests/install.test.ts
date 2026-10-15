import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

const installer = fileURLToPath(new URL('../../../skills/oxlint-maintainability/scripts/install.mjs', import.meta.url));
const modules = fileURLToPath(new URL('../../../node_modules', import.meta.url));
const oxlint = join(modules, 'oxlint/bin/oxlint');

test('installing copies a runnable preset while preserving consumer configuration', () => {
  const directory = mkdtempSync(join(tmpdir(), 'maintainable-install-'));
  try {
    const existing = '{ "rules": { "eqeqeq": "error" } }\n';
    writeFileSync(join(directory, '.oxlintrc.json'), existing);
    const result = spawnSync(process.execPath, [installer], { cwd: directory, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(readFileSync(join(directory, 'tools/oxlint/maintainable/config.json'), 'utf8').includes('consistent-type-assertions'));
    assert.equal(existsSync(join(directory, 'tools/oxlint/maintainable/vite.ts')), false);
    assert.equal(readFileSync(join(directory, '.oxlintrc.json'), 'utf8'), existing);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('an installed preset reports re-exports through the actual Oxlint CLI', () => {
  const directory = mkdtempSync(join(tmpdir(), 'maintainable-consumer-'));
  try {
    symlinkSync(modules, join(directory, 'node_modules'), 'dir');
    writeFileSync(join(directory, 'package.json'), '{ "type": "module" }');
    const install = spawnSync(process.execPath, [installer], { cwd: directory, encoding: 'utf8' });
    assert.equal(install.status, 0, install.stderr);
    writeFileSync(join(directory, '.oxlintrc.json'), JSON.stringify({ extends: ['./tools/oxlint/maintainable/config.json'] }));
    writeFileSync(join(directory, 'index.ts'), "export { userSchema } from './users/user';\n");
    const result = spawnSync(process.execPath, [oxlint, '-c', '.oxlintrc.json', '--format', 'json', 'index.ts'], { cwd: directory, encoding: 'utf8' });
    assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
    const report = JSON.parse(result.stdout);
    assert.ok(report.diagnostics.some((diagnostic: { code: string }) => diagnostic.code.includes('no-re-exports')), result.stdout);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('an interrupted asset copy leaves no partial installation or consumer changes', t => {
  const directory = mkdtempSync(join(tmpdir(), 'mi-'));
  const skill = join(directory, 'skill');
  mkdirSync(join(skill, 'scripts'), { recursive: true });
  mkdirSync(join(skill, 'assets/maintainable'), { recursive: true });
  copyFileSync(installer, join(skill, 'scripts/install.mjs'));
  writeFileSync(join(skill, 'assets/maintainable/config.json'), '{}');
  const unreadable = join(skill, 'assets/maintainable/unreadable.ts');
  writeFileSync(unreadable, 'export const policy = true;');
  chmodSync(unreadable, 0);
  t.after(() => {
    chmodSync(unreadable, 0o600);
    rmSync(directory, { recursive: true, force: true });
  });
  const result = spawnSync(process.execPath, [join(skill, 'scripts/install.mjs'), 'consumer/plugin'], { cwd: directory, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.equal(existsSync(join(directory, 'consumer/plugin')), false, 'a failed copy must be retryable');
  assert.match(result.stderr, /Could not install/);
  assert.doesNotMatch(result.stderr, /at (?:Module|file:)/);
});

test('existing files, directories, and live or dangling links are never replaced', t => {
  const directory = mkdtempSync(join(tmpdir(), 'maintainable-collisions-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(join(directory, 'owned.ts'), 'consumer policy');
  mkdirSync(join(directory, 'empty'));
  mkdirSync(join(directory, 'populated'));
  writeFileSync(join(directory, 'populated/policy.ts'), 'consumer policy');
  symlinkSync('owned.ts', join(directory, 'live'));
  symlinkSync('absent', join(directory, 'dangling'));
  for (const destination of ['owned.ts', 'empty', 'populated', 'live', 'dangling']) {
    const result = spawnSync(process.execPath, [installer, destination], { cwd: directory, encoding: 'utf8' });
    assert.equal(result.status, 1, destination);
    assert.match(result.stderr, /Refusing to overwrite/);
  }
  assert.equal(readFileSync(join(directory, 'owned.ts'), 'utf8'), 'consumer policy');
  assert.equal(readFileSync(join(directory, 'populated/policy.ts'), 'utf8'), 'consumer policy');
  assert.ok(lstatSync(join(directory, 'dangling')).isSymbolicLink());
});

test('concurrent installers leave one complete installation', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'maintainable-concurrent-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const run = () => new Promise<number | null>((resolve, reject) => {
    const child = spawn(process.execPath, [installer], { cwd: directory, stdio: 'ignore' });
    child.once('error', reject);
    child.once('exit', resolve);
  });
  assert.deepEqual((await Promise.all([run(), run()])).sort(), [0, 1]);
  const preset = JSON.parse(readFileSync(join(directory, 'tools/oxlint/maintainable/config.json'), 'utf8'));
  assert.equal(preset.rules['maintainable/no-re-exports'], 'error');
  assert.ok(readFileSync(join(directory, 'tools/oxlint/maintainable/rules/no-re-exports.ts'), 'utf8').includes('createOnce'));
});

test('invalid installer arguments fail before creating output', t => {
  const directory = mkdtempSync(join(tmpdir(), 'maintainable-arguments-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const args of [['--force'], ['one', 'two'], ['--vite', '--vite']]) {
    const result = spawnSync(process.execPath, [installer, ...args], { cwd: directory, encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Usage:/);
  }
  assert.equal(existsSync(join(directory, 'tools')), false);
});

test('Vite+ installation generates object presets from the canonical JSON', async t => {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), 'maintainable-vite-')));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(join(directory, 'package.json'), '{ "type": "module" }');
  const destination = 'config/lint #规则';
  const result = spawnSync(process.execPath, [installer, '--vite', destination], { cwd: directory, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /lint\.extends/);
  for (const [json, module] of [['config', 'vite'], ['stack', 'vite-stack'], ['type-aware', 'vite-type-aware']]) {
    const original = JSON.parse(readFileSync(join(directory, destination, `${json}.json`), 'utf8'));
    const { default: generated } = await import(pathToFileURL(join(directory, destination, `${module}.ts`)).href);
    const expected = { ...original };
    if (original.jsPlugins) expected.jsPlugins = original.jsPlugins.map((plugin: { name: string; specifier: string }) => ({
      ...plugin, specifier: pathToFileURL(join(directory, destination, plugin.specifier)).href,
    }));
    assert.deepEqual(generated, expected);
  }
});

test('invalid preset assets cannot leave a half-generated Vite+ installation', t => {
  const directory = mkdtempSync(join(tmpdir(), 'maintainable-invalid-preset-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  mkdirSync(join(directory, 'skill/scripts'), { recursive: true });
  mkdirSync(join(directory, 'skill/assets/maintainable'), { recursive: true });
  copyFileSync(installer, join(directory, 'skill/scripts/install.mjs'));
  writeFileSync(join(directory, 'skill/assets/maintainable/config.json'), '{ broken JSON');
  const result = spawnSync(process.execPath, [join(directory, 'skill/scripts/install.mjs'), '--vite', 'consumer/plugin'], { cwd: directory, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Could not install/);
  assert.equal(existsSync(join(directory, 'consumer/plugin')), false);
});
