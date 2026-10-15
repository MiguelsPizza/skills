import { eslintCompatPlugin } from '@oxlint/plugins';

import { noInternalModuleMockingRule } from './rules/no-internal-module-mocking.ts';
import { noInternalShapeChurnRule } from './rules/no-internal-shape-churn.ts';
import { noReExportsRule } from './rules/no-re-exports.ts';
import { noTrivialForwardingWrapperRule } from './rules/no-trivial-forwarding-wrapper.ts';

const maintainablePlugin = eslintCompatPlugin({
  meta: { name: 'maintainable' },
  rules: {
    'no-re-exports': noReExportsRule,
    'no-internal-module-mocking': noInternalModuleMockingRule,
    'no-trivial-forwarding-wrapper': noTrivialForwardingWrapperRule,
    'no-internal-shape-churn': noInternalShapeChurnRule,
  },
});

export default maintainablePlugin;
