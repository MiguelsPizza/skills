import { describe, it } from 'node:test';

import { RuleTester } from 'oxlint/plugins-dev';

import { noInternalModuleMockingRule } from '../../../skills/oxlint-maintainability/assets/maintainable/rules/no-internal-module-mocking.ts';

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } });
const depth = 2048;
const last = `alias${depth - 1}`;
function aliasChain(first: string): string {
  return Array.from({ length: depth }, (_, index) =>
    `const alias${index} = ${index === 0 ? first : `alias${index - 1}`};`).join('\n');
}
const cyclic = aliasChain(last);

tester.run('mocking resolves bounded flat alias chains and terminates cycles', noInternalModuleMockingRule, {
  valid: [
    { name: 'cyclic framework handle aliases', code: `${cyclic}\n${last}.mock('./store');` },
    { name: 'cyclic module path aliases', code: `${cyclic}\nvi.mock(${last});` },
    { name: 'cyclic extracted method aliases', code: `${cyclic}\n${last}('./store');` },
  ],
  invalid: [
    { name: 'deep framework handle aliases', code: `${aliasChain('vi')}\n${last}.mock('./store');`, errors: [{ messageId: 'internalModuleMock' }] },
    { name: 'deep module path aliases', code: `${aliasChain("'./store'")}\nvi.mock(${last});`, errors: [{ messageId: 'internalModuleMock' }] },
    { name: 'deep extracted method aliases', code: `${aliasChain('vi.mock')}\n${last}('./store');`, errors: [{ messageId: 'internalModuleMock' }] },
  ],
});
