import { describe, it } from "node:test";

import { RuleTester } from "oxlint/plugins-dev";

import { noReExportsRule } from "../../../skills/oxlint-maintainability/assets/maintainable/rules/no-re-exports.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const aliases = Array.from({ length: 2048 }, (_, index) => `const Store${index + 1} = Store${index};`).join("\n");
const typeAliases = Array.from({ length: 2048 }, (_, index) => `type Store${index + 1} = Store${index};`).join("\n");

tester.run("maintainable/no-re-exports bounded alias traversal", noReExportsRule, {
  valid: [
    {
      name: "2048 stable member aliases preserve mutation ownership",
      code: `import { settings as Store0 } from './settings';\n${aliases}\nStore2048.network.timeout = 5000; export default Store0.network.timeout;`,
    },
    { name: "2048 value aliases ending at a local declaration", code: `class Store0 {}\n${aliases}\nexport { Store2048 };` },
    { name: "2048 value aliases closing a cycle", code: `const Store0 = Store2048;\n${aliases}\nexport { Store2048 };` },
    { name: "2048 type aliases closing a cycle", code: `type Store0 = Store2048;\n${typeAliases}\nexport type { Store2048 };` },
  ],
  invalid: [{
    name: "2048 stable member aliases leave neighboring property imported",
    code: `import { settings as Store0 } from './settings';\n${aliases}\nStore2048.network.timeout = 5000; export default Store0.network.retries;`,
    errors: [{ messageId: "reExport" }],
  }, {
    name: "2048 value aliases reaching an import",
    code: `import { UserStore as Store0 } from './user-store';\n${aliases}\nexport { Store2048 };`,
    errors: [{ messageId: "reExport" }],
  }, {
    name: "2048 type aliases reaching an import",
    code: `import type { UserStore as Store0 } from './user-store';\n${typeAliases}\nexport type { Store2048 };`,
    errors: [{ messageId: "reExport" }],
  }],
});
