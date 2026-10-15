import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import test, { type TestContext } from 'node:test';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const rootAudit = join(repository, 'scripts/audit-typescript-repo.sh');
const skillAudit = join(repository, 'skills/maintainable-typescript/scripts/audit-typescript-repo.sh');

interface Invocation {
  tool: string;
  cwd: string;
  args: string[];
}

function project(t: TestContext, tools: Record<string, number> = {}) {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), 'maintainable-audit-')));
  const target = join(directory, 'project with spaces');
  const trace = join(directory, 'invocations.jsonl');
  mkdirSync(join(target, 'node_modules/.bin'), { recursive: true });
  writeFileSync(join(target, 'package.json'), '{}');
  for (const [tool, status] of Object.entries(tools)) {
    const bin = join(target, 'node_modules/.bin', tool);
    writeFileSync(bin, `#!${process.execPath}\nrequire('node:fs').appendFileSync(process.env.AUDIT_TRACE, JSON.stringify({ tool: ${JSON.stringify(tool)}, cwd: process.cwd(), args: process.argv.slice(2) }) + '\\n'); process.exit(${status});\n`);
    chmodSync(bin, 0o755);
  }
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return {
    directory,
    target,
    run(script = rootAudit) {
      return spawnSync('bash', [script, relative(directory, target)], {
        cwd: directory,
        encoding: 'utf8',
        maxBuffer: 2 * 1024 * 1024,
        env: { ...process.env, AUDIT_TRACE: trace },
      });
    },
    invocations(): Invocation[] {
      return existsSync(trace) ? readFileSync(trace, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line)) : [];
    },
  };
}

test('the repository audit runs a relative target with Vite+ from the target directory', t => {
  const fixture = project(t, { vp: 0 });
  const result = fixture.run();
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(fixture.invocations(), [{ tool: 'vp', cwd: fixture.target, args: ['lint'] }]);
});

test('every bundled audit tool reads configuration from the target directory', t => {
  const fixture = project(t, { tsc: 0, oxlint: 0, fallow: 0 });
  writeFileSync(join(fixture.target, 'tsconfig.json'), '{}');
  const result = fixture.run(skillAudit);
  assert.equal(result.status, 0, result.stderr);
  const calls = fixture.invocations();
  assert.equal(calls.length, 7);
  assert.ok(calls.every(call => call.cwd === fixture.target), JSON.stringify(calls));
  assert.deepEqual(calls.map(call => call.tool), ['tsc', 'oxlint', 'fallow', 'fallow', 'fallow', 'fallow', 'fallow']);
});

test('an audit reports findings while still running every remaining check', t => {
  const fixture = project(t, { tsc: 1, oxlint: 0, fallow: 0 });
  writeFileSync(join(fixture.target, 'tsconfig.json'), '{}');
  const result = fixture.run();
  assert.equal(result.status, 1, result.stdout);
  assert.equal(fixture.invocations().length, 7);
});

test('tool failures outrank findings and never prevent the remaining checks', t => {
  const fixture = project(t, { tsc: 1, oxlint: 2, fallow: 0 });
  writeFileSync(join(fixture.target, 'tsconfig.json'), '{}');
  const result = fixture.run();
  assert.equal(result.status, 2);
  assert.equal(fixture.invocations().length, 7);
  assert.match(result.stderr, /Failed \(2\): Oxlint/);
});

test('Vite+ takes precedence over standalone Oxlint and carries its failure to the caller', t => {
  const fixture = project(t, { vp: 2, oxlint: 0, fallow: 0 });
  const result = fixture.run();
  assert.equal(result.status, 2);
  const calls = fixture.invocations();
  assert.equal(calls.some(call => call.tool === 'oxlint'), false);
  assert.deepEqual(calls[0], { tool: 'vp', cwd: fixture.target, args: ['lint'] });
  assert.equal(calls.filter(call => call.tool === 'fallow').length, 5);
});

test('missing tools are explicitly skipped without installing anything', t => {
  const fixture = project(t);
  const result = fixture.run();
  assert.equal(result.status, 0);
  assert.deepEqual(fixture.invocations(), []);
  assert.match(result.stdout, /Skipped: no tsconfig/);
  assert.match(result.stdout, /Skipped: install/);
  assert.equal(existsSync(join(fixture.target, 'pnpm-lock.yaml')), false);
});

test('invalid targets fail before running any tools', t => {
  const fixture = project(t, { fallow: 0 });
  rmSync(join(fixture.target, 'package.json'));
  const missingManifest = fixture.run();
  assert.equal(missingManifest.status, 1);
  assert.match(missingManifest.stderr, /No package.json/);
  rmSync(fixture.target, { recursive: true });
  const missingDirectory = fixture.run();
  assert.equal(missingDirectory.status, 1);
  assert.match(missingDirectory.stderr, /Target directory not found/);
  assert.deepEqual(fixture.invocations(), []);
});

test('Fallow findings are retained across all audit phases', t => {
  const fixture = project(t, { fallow: 1 });
  const result = fixture.run();
  assert.equal(result.status, 1);
  assert.equal(fixture.invocations().length, 5);
  assert.match(result.stderr, /Duplicate code audit/);
  assert.match(result.stderr, /Architecture audit/);
  assert.match(result.stderr, /Fallow health/);
});

test('the audit loads consumer config through real TypeScript and Oxlint binaries', t => {
  const fixture = project(t);
  rmSync(join(fixture.target, 'node_modules'), { recursive: true });
  symlinkSync(join(repository, 'node_modules'), join(fixture.target, 'node_modules'), 'dir');
  writeFileSync(join(fixture.target, 'package.json'), '{ "type": "module" }');
  writeFileSync(join(fixture.target, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true, noEmit: true, types: [], target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler' }, include: ['*.ts'] }));
  writeFileSync(join(fixture.target, '.oxlintrc.json'), JSON.stringify({ extends: [join(repository, 'skills/oxlint-maintainability/assets/maintainable/config.json')] }));
  writeFileSync(join(fixture.target, 'owner.ts'), 'export const requestTimeoutMs = 5000;');
  writeFileSync(join(fixture.target, 'index.ts'), "export { requestTimeoutMs } from './owner';");
  const invalid = fixture.run();
  assert.equal(invalid.status, 1, `${invalid.stdout?.slice(0, 4000)}\n${invalid.stderr}`);
  assert.match(`${invalid.stdout}\n${invalid.stderr}`, /no-re-exports/);
  writeFileSync(join(fixture.target, 'index.ts'), 'export const applicationName = "audit-consumer";');
  const valid = fixture.run();
  assert.equal(valid.status, 0, `${valid.stdout}\n${valid.stderr}`);
});
