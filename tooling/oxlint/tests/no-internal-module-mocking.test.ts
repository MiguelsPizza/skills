import { describe, it } from "node:test";

import { RuleTester } from "oxlint/plugins-dev";

import { noInternalModuleMockingRule } from "../../../skills/oxlint-maintainability/assets/maintainable/rules/no-internal-module-mocking.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "internalModuleMock" };

tester.run("maintainable/no-internal-module-mocking", noInternalModuleMockingRule, {
  valid: [
    "const vi = { mock(path: string) { return path; } }; vi.mock('./user-store');",
    "function usingFakeJest(jest: { mock(path: string): void }) { jest.mock('./user-store'); }",
    "import { vi } from './test-helpers'; vi.mock('./user-store');",
    "import * as tests from './test-helpers'; tests.vi.mock('./user-store');",
    "import * as tests from 'vitest'; tests.mock('./user-store');",
    "import { vi } from 'vitest'; function usingFakeApi(vi: { mock(path: string): void }) { vi.mock('./user-store'); }",
    "vi.mock(import('stripe'));",
    "vi.mock(modulePath);",
    "vi.mock(`./${moduleName}`);",
    "vi.mock(...modulePaths);",
    "vi.mock();",
    "vi.unmock('./user-store');",
    "jest.requireActual('./user-store');",
    "vi.mock('@workspace/user-store');",
    { code: "vi.mock('@repo/user-store');", options: [{ internalModulePrefixes: [] }] },
    {
      code: "vi.mock('@workspace/core-external');",
      options: [{ internalModulePrefixes: ["@workspace/core"] }],
    },
    "function useFakeApi(vi: { mock(path: string): void }) { vi.mock('./user-store'); }",
    "vi.mock('stripe');",
    "jest.mock('@aws-sdk/client-s3');",
    "vi.spyOn(store, 'save');",
  ],
  invalid: [
    { code: "jest.setMock('./user-store', { save() {} });", errors: [error] },
    { code: "jest.mock('../user-store');", errors: [error] },
    { code: "vi.doMock('@/user-store');", errors: [error] },
    { code: "jest.unstable_mockModule('~/user-store');", errors: [error] },
    { code: "vi.mock('#user-store');", errors: [error] },
    { code: "vi.mock('.');", errors: [error] },
    { code: "vi.mock('..');", errors: [error] },
    { code: "import { jest as testApi } from '@jest/globals'; testApi.mock('./user-store');", errors: [error] },
    { code: "import * as tests from '@jest/globals'; tests.jest.doMock('./user-store');", errors: [error] },
    { code: "import * as tests from 'vitest'; tests['vi']['mock']('./user-store');", errors: [error] },
    { code: "import { vi } from 'vitest'; vi.mock('./user-store');", errors: [error] },
    { code: "vi.mock(import(`./user-store`));", errors: [error] },
    { code: "vi.mock('@workspace/core');", options: [{ internalModulePrefixes: ["@workspace/core"] }], errors: [error] },
    { code: "vi.mock('@workspace/core/store');", options: [{ internalModulePrefixes: ["@workspace/core"] }], errors: [error] },
    { code: "vi.mock('C:/src/user-store');", errors: [error] },
    { code: "jest.mock('/src/user-store');", errors: [error] },
    { code: "vi.mock(`./user-store`);", errors: [error] },
    { code: "vi.mock(import('./user-store'));", errors: [error] },
    {
      code: "vi.mock('@workspace/user-store');",
      options: [{ internalModulePrefixes: ["@workspace/"] }],
      errors: [error],
    },
    { code: "vi.mock('@repo/user-store');", errors: [error] },
    { code: "vi['doMock']('./user-store');", errors: [error] },
    { code: "import * as tests from 'vitest'; tests.vi.mock('./user-store');", errors: [error] },
    { code: "vi.mock('./user-store');", errors: [error] },
    { code: "import { vi as testApi } from 'vitest'; testApi.mock('./user-store');", errors: [error] },
  ],
});
