import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
