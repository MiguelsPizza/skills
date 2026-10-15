import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const stackPath = fileURLToPath(new URL('../../../skills/oxlint-maintainability/assets/maintainable/stack.json', import.meta.url));
const typeAwarePath = fileURLToPath(new URL('../../../skills/oxlint-maintainability/assets/maintainable/type-aware.json', import.meta.url));
const presetPath = fileURLToPath(new URL('../../../skills/oxlint-maintainability/assets/maintainable/config.json', import.meta.url));
const modules = fileURLToPath(new URL('../../../node_modules', import.meta.url));
const oxlintPath = join(modules, 'oxlint/bin/oxlint');

function lint(code: string, filename = 'feature.ts', preset = presetPath, typeAware = false) {
  const directory = mkdtempSync(join(tmpdir(), 'maintainable-preset-'));
  try {
    const source = JSON.parse(readFileSync(preset, 'utf8'));
    const rules = Object.fromEntries(Object.entries(source.rules).filter(([name]) => !name.startsWith('maintainable/')));
    const config = { ...source, rules, jsPlugins: [] };
    writeFileSync(join(directory, '.oxlintrc.json'), JSON.stringify(config));
    writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true, target: 'ES2022' }, include: ['*.ts'] }));
    writeFileSync(join(directory, filename), code);
    const result = spawnSync(process.execPath, [oxlintPath, '-c', '.oxlintrc.json', '--format', 'json', ...(typeAware ? ['--type-aware'] : []), filename], {
      cwd: directory,
      encoding: 'utf8',
      env: { ...process.env, PATH: `${join(modules, '.bin')}${delimiter}${process.env.PATH}` },
    });
    assert.ifError(result.error);
    assert.ok(result.stdout, result.stderr || 'Oxlint produced no JSON');
    assert.ok(result.stdout.trim().startsWith('{'), `${result.stdout}\n${result.stderr}`);
    return { status: result.status, ...JSON.parse(result.stdout) };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('the type-aware add-on rejects unhandled asynchronous work', () => {
  const result = lint('declare function persistInstallation(): Promise<void>; export async function commitInstallation() { persistInstallation(); }', 'feature.ts', typeAwarePath, true);
  assert.equal(result.status, 1);
  assert.ok(result.diagnostics.some((diagnostic: { code: string }) => diagnostic.code.includes('no-floating-promises')));
  const valid = lint('declare function persistInstallation(): Promise<void>; export async function commitInstallation() { await persistInstallation(); }', 'feature.ts', typeAwarePath, true);
  assert.equal(valid.diagnostics.length, 0);
});

test('the type-aware add-on rejects no-unsafe-member-access', () => {
  const result = lint("export const name = JSON.parse(text).name;", 'feature.ts', typeAwarePath, true);
  assert.equal(result.status, 1);
  assert.ok(result.diagnostics.some((diagnostic: { code: string }) => diagnostic.code.includes('no-unsafe-member-access')));
});

test('the type-aware add-on rejects no-unsafe-call', () => {
  const result = lint("JSON.parse(text)();", 'feature.ts', typeAwarePath, true);
  assert.equal(result.status, 1);
  assert.ok(result.diagnostics.some((diagnostic: { code: string }) => diagnostic.code.includes('no-unsafe-call')));
});

test('the type-aware add-on rejects no-unsafe-argument', () => {
  const result = lint("declare function saveUser(user: { name: string }): void; saveUser(JSON.parse(text));", 'feature.ts', typeAwarePath, true);
  assert.equal(result.status, 1);
  assert.ok(result.diagnostics.some((diagnostic: { code: string }) => diagnostic.code.includes('no-unsafe-argument')));
});

test('the type-aware add-on rejects no-unsafe-assignment', () => {
  const result = lint("export const user: { name: string } = JSON.parse(text);", 'feature.ts', typeAwarePath, true);
  assert.equal(result.status, 1);
  assert.ok(result.diagnostics.some((diagnostic: { code: string }) => diagnostic.code.includes('no-unsafe-assignment')));
});

test('the preset rejects type assertions while permitting const assertions and satisfies', () => {
  const result = lint('export const user = response as User;');
  assert.equal(result.status, 1);
  assert.ok(result.diagnostics.some((diagnostic: { code: string }) => diagnostic.code.includes('consistent-type-assertions')));
  const valid = lint('export const limits = { attempts: 3 } as const satisfies Record<string, number>;');
  assert.equal(valid.status, 0);
  assert.equal(valid.diagnostics.length, 0);
});

test('the opt-in stack rejects Next.js and DOM emulators while allowing the chosen stack', () => {
  for (const module of ['next', 'next/navigation', 'jsdom', 'happy-dom']) {
    const result = lint(`import * as dependency from '${module}'; dependency.start();`, 'feature.ts', stackPath);
    assert.equal(result.status, 1, module);
    assert.ok(result.diagnostics.some((diagnostic: { code: string }) => diagnostic.code.includes('no-restricted-imports')), module);
  }
  assert.equal(lint("import { createRouter } from '@tanstack/react-router'; createRouter({ routeTree });", 'feature.ts', stackPath).status, 0);
});

test('the opt-in stack rejects synchronous state mirroring in effects while allowing external synchronization', () => {
  const invalid = lint(`
    import { useEffect, useState } from 'react';
    export function UsersPage({ users }) {
      const [visibleUsers, setVisibleUsers] = useState(users);
      useEffect(() => { setVisibleUsers(users); }, [users]);
      return <UsersTable users={visibleUsers} />;
    }
  `, 'feature.tsx', stackPath);
  assert.equal(invalid.status, 1);
  assert.ok(invalid.diagnostics.some((diagnostic: { code: string }) => diagnostic.code.includes('set-state-in-effect')));
  const valid = lint(`
    import { useEffect } from 'react';
    export function ConnectionProvider({ connection }) {
      useEffect(() => { connection.connect(); return () => connection.disconnect(); }, [connection]);
      return null;
    }
  `, 'feature.tsx', stackPath);
  assert.equal(valid.status, 0);
});

test('the opt-in stack reports raw console output for review without blocking the command', () => {
  const result = lint("console.error('User lookup failed', error);", 'feature.ts', stackPath);
  assert.equal(result.status, 0);
  assert.ok(result.diagnostics.some((diagnostic: { code: string; severity: string }) => diagnostic.code.includes('no-console') && diagnostic.severity === 'warning'));
});

test('the opt-in stack reports numeric behavior literals while permitting named constants and identities', () => {
  const result = lint('export const nextDelay = delay * 5000;', 'feature.ts', stackPath);
  assert.equal(result.status, 0);
  assert.ok(result.diagnostics.some((diagnostic: { code: string }) => diagnostic.code.includes('no-magic-numbers')));
  const valid = lint('const RETRY_DELAY_MS = 5000; export const nextDelay = RETRY_DELAY_MS * attempt; export const first = values[0];', 'feature.ts', stackPath);
  assert.equal(valid.diagnostics.length, 0);
});

test('the preset requires explained expect-error comments and rejects ignored type errors', () => {
  for (const directive of ['@ts-ignore', '@ts-nocheck', '@ts-expect-error']) {
    const result = lint(`// ${directive}\nexport const value = getValue();`);
    assert.equal(result.status, 1, directive);
    assert.ok(result.diagnostics.some((diagnostic: { code: string }) => diagnostic.code.includes('ban-ts-comment')));
  }
  assert.equal(lint('// @ts-expect-error: upstream SDK incorrectly excludes this documented event\nexport const value = getValue();').status, 0);
});

test('the preset rejects empty and rethrow-only catches but allows error translation and cleanup', () => {
  for (const code of ['try { save(); } catch (error) {}', 'try { save(); } catch (error) { throw error; }']) {
    const result = lint(code);
    assert.equal(result.status, 1);
    assert.ok(result.diagnostics.some((diagnostic: { code: string }) => /no-empty|no-useless-catch/.test(diagnostic.code)));
  }
  assert.equal(lint('try { save(); } catch (cause) { throw new Error("Installation could not be saved", { cause }); } finally { connection.close(); }').status, 0);
});

test('the preset rejects explicit any and non-null assertions instead of fabricating type evidence', () => {
  const result = lint('export function userId(user: any) { return user!.id; }');
  assert.equal(result.status, 1);
  for (const rule of ['no-explicit-any', 'no-non-null-assertion']) {
    assert.ok(result.diagnostics.some((diagnostic: { code: string }) => diagnostic.code.includes(rule)), rule);
  }
});

test('the type-aware add-on reports redundant null checks while permitting optional inputs', () => {
  const result = lint('export function userName(user: { name: string }) { if (!user) return "Missing"; return user.name; }', 'feature.ts', typeAwarePath, true);
  assert.ok(result.diagnostics.some((diagnostic: { code: string }) => diagnostic.code.includes('no-unnecessary-condition')));
  const valid = lint('export function userName(user: { name: string } | undefined) { if (!user) return "Missing"; return user.name; }', 'feature.ts', typeAwarePath, true);
  assert.equal(valid.diagnostics.length, 0);
});

test('the type-aware add-on rejects unparsed external data flowing into a typed return', () => {
  const result = lint('export function loadUser(text: string): { name: string } { return JSON.parse(text); }', 'feature.ts', typeAwarePath, true);
  assert.equal(result.status, 1);
  assert.ok(result.diagnostics.some((diagnostic: { code: string }) => diagnostic.code.includes('no-unsafe-return')));
  const valid = lint('export function loadRawValue(text: string): unknown { return JSON.parse(text); }', 'feature.ts', typeAwarePath, true);
  assert.equal(valid.diagnostics.length, 0);
});
