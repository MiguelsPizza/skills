import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test, { type TestContext } from 'node:test';

const builder = fileURLToPath(new URL('../../../scripts/build-skill-archive.sh', import.meta.url));
const repository = fileURLToPath(new URL('../../../', import.meta.url));

function archiveProject(t: TestContext) {
  const directory = mkdtempSync(join(tmpdir(), 'skill-archive-'));
  const skills = join(directory, 'skills');
  const script = join(directory, 'scripts/build-skill-archive.sh');
  mkdirSync(join(directory, 'scripts'));
  mkdirSync(join(skills, 'example-skill'), { recursive: true });
  copyFileSync(builder, script);
  writeFileSync(join(skills, 'example-skill/SKILL.md'), '# Example skill\n');
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return { directory, skills, script };
}

function extractAndVerify(archive: string, source: string, destination: string) {
  const unpacked = spawnSync('unzip', ['-q', archive, '-d', destination], { encoding: 'utf8' });
  assert.equal(unpacked.status, 0, unpacked.stderr);
  const extracted = join(destination, basename(source));
  const files = (root: string) => readdirSync(root, { recursive: true, encoding: 'utf8' }).filter(path => statSync(join(root, path)).isFile() && !path.endsWith('.DS_Store')).sort();
  assert.deepEqual(files(extracted), files(source), `${basename(source)} file inventory`);
  for (const file of files(source)) {
    assert.ok(readFileSync(join(extracted, file)).equals(readFileSync(join(source, file))), `Rebuild stale archive: ${basename(source)}/${file}`);
  }
}

test('a failed archive build preserves the previous release and removes temporary output', t => {
  const fixture = archiveProject(t);
  const archive = join(fixture.skills, 'example-skill.zip');
  const previous = Buffer.from('previous release');
  writeFileSync(archive, previous);
  const binaries = join(fixture.directory, 'bin');
  mkdirSync(binaries);
  writeFileSync(join(binaries, 'zip'), '#!/usr/bin/env bash\nexit 7\n');
  chmodSync(join(binaries, 'zip'), 0o755);
  const result = spawnSync('bash', [fixture.script, 'example-skill'], {
    encoding: 'utf8', env: { ...process.env, PATH: `${binaries}${delimiter}${process.env.PATH}` },
  });
  assert.equal(result.status, 7, result.stderr);
  assert.deepEqual(readFileSync(archive), previous);
  assert.deepEqual(readdirSync(fixture.skills).sort(), ['example-skill', 'example-skill.zip']);
});

test('archive targets stay inside the skills directory', t => {
  const fixture = archiveProject(t);
  mkdirSync(join(fixture.directory, 'outside'));
  writeFileSync(join(fixture.directory, 'outside/SKILL.md'), 'outside scope');
  for (const target of ['../outside', '-example-skill', 'example-skill/../example-skill']) {
    const result = spawnSync('bash', [fixture.script, target], { encoding: 'utf8' });
    assert.equal(result.status, 1, target);
    assert.match(result.stderr, /Invalid skill name/);
  }
});

test('building all archives fails when the skills directory is missing', t => {
  const fixture = archiveProject(t);
  rmSync(fixture.skills, { recursive: true });
  const result = spawnSync('bash', [fixture.script, 'all'], { encoding: 'utf8' });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /Skills directory not found/);
});

test('an existing directory cannot be mistaken for the finished zip', t => {
  const fixture = archiveProject(t);
  mkdirSync(join(fixture.skills, 'example-skill.zip'));
  const result = spawnSync('bash', [fixture.script, 'example-skill'], { encoding: 'utf8' });
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stderr, /Archive path is a directory/);
  assert.deepEqual(readdirSync(join(fixture.skills, 'example-skill.zip')), []);
});

test('all archives contain current sources and the extracted Oxlint skill runs in a fresh consumer', t => {
  const fixture = archiveProject(t);
  for (const skill of ['maintainable-typescript', 'oxlint-maintainability']) {
    cpSync(join(repository, 'skills', skill), join(fixture.skills, skill), { recursive: true });
  }
  writeFileSync(join(fixture.skills, 'example-skill/.DS_Store'), 'desktop metadata');
  const built = spawnSync('bash', [fixture.script, 'all'], { cwd: tmpdir(), encoding: 'utf8' });
  assert.equal(built.status, 0, built.stderr);
  const extracted = join(fixture.directory, 'extracted');
  for (const skill of ['example-skill', 'maintainable-typescript', 'oxlint-maintainability']) {
    extractAndVerify(join(fixture.skills, `${skill}.zip`), join(fixture.skills, skill), extracted);
  }
  assert.equal(readdirSync(join(extracted, 'example-skill')).includes('.DS_Store'), false);
  const consumer = join(fixture.directory, 'consumer');
  mkdirSync(consumer);
  symlinkSync(join(repository, 'node_modules'), join(consumer, 'node_modules'), 'dir');
  writeFileSync(join(consumer, 'package.json'), '{ "type": "module" }');
  const destination = 'config/lint rules';
  const installed = spawnSync(process.execPath, [join(extracted, 'oxlint-maintainability/scripts/install.mjs'), destination], { cwd: consumer, encoding: 'utf8' });
  assert.equal(installed.status, 0, installed.stderr);
  writeFileSync(join(consumer, '.oxlintrc.json'), JSON.stringify({ extends: [`./${destination}/config.json`] }));
  const cases = {
    '01-local-types.ts': 'type Pick<T, _K> = T; export type Settings = Pick<{ id: string }, "id">;',
    '02-owned.ts': 'export const settings = { requestTimeoutMs: 5000 };',
    '03-forwarded.ts': 'export { settings } from "./02-owned";',
    '04-local-api.ts': 'const vi = { mock(_path: string) {} }; vi.mock("./02-owned");',
    '05-internal.test.ts': 'import { vi } from "vitest"; vi.mock("./02-owned");',
    '06-built-in-type.ts': 'export type Settings = Pick<{ id: string; label: string }, "id">;',
    '07-wrapper.ts': 'declare function save(value: string): void; export function persist(value: string) { return save(value); }',
    '08-projection.ts': 'export function payload(input: { id: string; name: string }) { return { id: input.id }; }',
  };
  for (const [file, code] of Object.entries(cases)) writeFileSync(join(consumer, file), code);
  const cli = join(repository, 'node_modules/oxlint/bin/oxlint');
  for (const files of [Object.keys(cases), Object.keys(cases).reverse()]) {
    const result = spawnSync(process.execPath, [cli, '--threads', '1', '--format', 'json', ...files], { cwd: consumer, encoding: 'utf8' });
    assert.equal(result.status, 1, result.stderr);
    const report: { diagnostics: { filename: string; code: string }[] } = JSON.parse(result.stdout);
    assert.deepEqual(report.diagnostics.map(diagnostic => [diagnostic.filename, diagnostic.code]).sort(), [
      ['03-forwarded.ts', 'maintainable(no-re-exports)'],
      ['05-internal.test.ts', 'maintainable(no-internal-module-mocking)'],
      ['06-built-in-type.ts', 'maintainable(no-internal-shape-churn)'],
      ['07-wrapper.ts', 'maintainable(no-trivial-forwarding-wrapper)'],
      ['08-projection.ts', 'maintainable(no-internal-shape-churn)'],
    ]);
  }
});

test('committed skill archives match the shipped sources', t => {
  const directory = mkdtempSync(join(tmpdir(), 'skill-release-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const skill of ['maintainable-typescript', 'oxlint-maintainability']) {
    extractAndVerify(join(repository, 'skills', `${skill}.zip`), join(repository, 'skills', skill), directory);
  }
});
