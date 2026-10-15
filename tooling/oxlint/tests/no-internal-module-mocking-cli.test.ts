import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const plugin = fileURLToPath(new URL('../../../skills/oxlint-maintainability/assets/maintainable/index.ts', import.meta.url));
const oxlint = fileURLToPath(new URL('../../../node_modules/oxlint/bin/oxlint', import.meta.url));
const rule = 'maintainable/no-internal-module-mocking';

function lint(directory: string, paths: string[]) {
  const result = spawnSync(process.execPath, [oxlint, '-c', '.oxlintrc.json', '--threads', '1', '--format', 'json', ...paths], {
    cwd: directory, encoding: 'utf8',
  });
  assert.ifError(result.error);
  return result;
}

test('mocking options reset across files, overrides, and framework bindings in one worker', () => {
  const directory = mkdtempSync(join(tmpdir(), 'maintainable-mocking-overrides-'));
  try {
    writeFileSync(join(directory, '.oxlintrc.json'), JSON.stringify({
      jsPlugins: [{ name: 'maintainable', specifier: plugin }],
      categories: { correctness: 'off' },
      rules: { [rule]: 'error' },
      overrides: [
        { files: ['a-custom.ts'], rules: { [rule]: ['error', { internalModulePrefixes: ['@acme/core'] }] } },
        { files: ['c-empty.ts'], rules: { [rule]: ['error', { internalModulePrefixes: [] }] } },
      ],
    }));
    const paths = ['a-custom.ts', 'b-default.ts', 'c-empty.ts', 'd-default.ts', 'e-shadowed.ts', 'f-replaced.ts', 'g-default.ts'];
    writeFileSync(join(directory, paths[0]), "const { jest: { mock } } = require('@jest/globals'); mock('@acme/core/store'); mock('@acme/core-sdk'); mock('@repo/store');");
    writeFileSync(join(directory, paths[1]), "const api = vi; api.mock('@repo/store'); api.mock('@acme/core/store');");
    writeFileSync(join(directory, paths[2]), "const mock = jest.mock; mock('@repo/store'); mock('#store'); mock('./store');");
    writeFileSync(join(directory, paths[3]), "import { vitest } from 'vitest'; vitest.doMock('#store');");
    writeFileSync(join(directory, paths[4]), "const vi = { mock(path: string) { return path; } }; vi.mock('./store');");
    writeFileSync(join(directory, paths[5]), "import { vi } from 'vitest'; vi.mock = customMock; vi.mock('./store');");
    writeFileSync(join(directory, paths[6]), "import { vi } from 'vitest'; vi.mock('./store');");
    for (const order of [paths, [...paths].reverse()]) {
      const result = lint(directory, order);
      assert.equal(result.status, 1, result.stderr);
      const report: { diagnostics: { code: string; filename: string }[] } = JSON.parse(result.stdout);
      assert.equal(report.diagnostics.length, 5, result.stdout);
      for (const filename of paths) {
        assert.equal(report.diagnostics.filter(diagnostic => diagnostic.filename.endsWith(filename) && diagnostic.code.includes('no-internal-module-mocking')).length,
          filename === 'e-shadowed.ts' || filename === 'f-replaced.ts' ? 0 : 1, result.stdout);
      }
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('the CLI rejects malformed mocking options before linting', () => {
  const directory = mkdtempSync(join(tmpdir(), 'maintainable-mocking-schema-'));
  try {
    writeFileSync(join(directory, 'store.test.ts'), "vi.mock('./store');");
    for (const options of [
      null,
      [],
      { internalModulePrefix: ['@acme/'] },
      { internalModulePrefixes: '@acme/' },
      { internalModulePrefixes: [42] },
      { internalModulePrefixes: [''] },
      { internalModulePrefixes: ['@acme/', '@acme/'] },
    ]) {
      writeFileSync(join(directory, '.oxlintrc.json'), JSON.stringify({
        jsPlugins: [{ name: 'maintainable', specifier: plugin }],
        rules: { [rule]: ['error', options] },
      }));
      const result = lint(directory, ['store.test.ts']);
      assert.notEqual(result.status, 0, JSON.stringify(options));
      assert.match(`${result.stderr}\n${result.stdout}`, /invalid|schema|configuration|options/i, JSON.stringify(options));
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
