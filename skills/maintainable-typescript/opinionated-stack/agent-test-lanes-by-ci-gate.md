---
example:
  primary: agent-test-lanes-by-ci-gate
  format: workflow
  implements:
    - agent-test-lanes-by-ci-gate
    - assert-milestones-not-model-prose
    - test-workers-in-the-workers-runtime
    - test-react-apps-in-real-browsers
references:
  authority:
    - title: Playwright Best Practices
      url: https://playwright.dev/docs/best-practices
    - title: Workers AI Limits
      url: https://developers.cloudflare.com/workers-ai/platform/limits/
    - title: Workers AI GPT-OSS-20B
      url: https://developers.cloudflare.com/workers-ai/models/gpt-oss-20b
  supporting: []
---
# Split Agent Test Lanes by CI Gate

**Rule:** For product apps that call a real LLM end-to-end, split CI into two gates. The PR gate runs fast, deterministic lanes: contract tests, browser-mode tests, and Workers integration tests. The nightly gate runs the real-model end-to-end lane against a low-cost pinned model, on one happy-path scenario plus a short adversarial set.

See also: [Assert Milestones, Not Model Prose](../references/assert-milestones-not-model-prose.md), [Test Workers in the Workers Runtime](test-workers-in-the-workers-runtime.md), [Test React Apps in Real Browsers](test-react-apps-in-real-browsers.md), and [Opinionated Stack Overview](stack-overview.md).

## Why agents get this wrong

Agents either put everything in one lane — shipping a PR gate that burns model budget on every push and still flakes on model variance — or they drop the e2e lane entirely because "it is flaky" and lose the only test that covers real product behavior. Both extremes fail: the first is expensive and unreliable, the second is a silent downgrade of the quality bar.

They also re-run the full e2e matrix on every PR, which multiplies cost without adding signal, and they forget that real-model lanes need structured milestone assertions ([Assert Milestones, Not Model Prose](../references/assert-milestones-not-model-prose.md)) to be stable at all.

## What to do instead

Treat the CI gates as two separate products with two separate budgets.

### PR gate (every push)

Lanes:

- Contract tests (schemas, serialization, pure transforms).
- Type 1 — Vitest Browser Mode + MSW, with contract-validated fixtures ([Test React Apps in Real Browsers](test-react-apps-in-real-browsers.md)).
- Type 2 — `@cloudflare/vitest-pool-workers` integration driven through the real HTTP entrypoint ([Test Workers in the Workers Runtime](test-workers-in-the-workers-runtime.md)).

Properties:

- No real model calls; any LLM reference is mocked at the external HTTP boundary with MSW.
- Deterministic — the same commit produces the same result.
- Fast enough that a contributor runs it locally before pushing.

### Nightly gate (scheduled)

Lanes:

- Type 3 — Playwright against a running app and a real model, driving the full user journey end to end.

Properties:

- Uses a single low-cost model (e.g. a Workers AI option such as `@cf/openai/gpt-oss-20b`) behind a pinned deterministic prompt template to bound variance.
- Covers one happy-path scenario plus a short adversarial set; not a full matrix.
- Asserts milestones, never model prose.
- Runs on a schedule and on manual dispatch — not on every PR.

### Flaky test playbook

When a real-model lane flakes:

1. Check whether the assertion targets model prose. If so, fix the assertion before touching the prompt.
2. Check whether the prompt template has drifted. Pin it behind a shared constant.
3. Check whether the milestone itself is actually produced by the app under every valid model output. If not, the product contract is weak, not the test.
4. Only after 1–3, consider widening tolerance or pinning a specific model revision.

Never silence a nightly failure with blanket `test.retry(3)` without investigation.

## Example

GitHub Actions workflow sketch:

```yaml
name: ci

on:
  pull_request:
  push:
    branches: [main]
  schedule:
    - cron: '0 7 * * *'
  workflow_dispatch:

jobs:
  pr-gate:
    if: github.event_name != 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: vp install
      - run: vp test --project contracts
      - run: vp test --project browser
      - run: vp test --project workers-integration

  nightly-e2e:
    if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    env:
      AGENT_MODEL: '@cf/openai/gpt-oss-20b'
      TEST_WEBHOOK_SECRET: ${{ secrets.TEST_WEBHOOK_SECRET }}
    steps:
      - uses: actions/checkout@v4
      - run: vp install
      - run: vp test --project e2e-real-model
```

Example implements: [Split Agent Test Lanes by CI Gate](agent-test-lanes-by-ci-gate.md), [Assert Milestones, Not Model Prose](../references/assert-milestones-not-model-prose.md), [Test Workers in the Workers Runtime](test-workers-in-the-workers-runtime.md), [Test React Apps in Real Browsers](test-react-apps-in-real-browsers.md).

## The test

Before routing a test suite, ask:

- Does this lane need a real model call to produce useful signal? If yes, it belongs in the nightly gate.
- Can this lane fail for model-variance reasons? If yes, is it asserting milestones instead of prose?
- Is the PR gate fully deterministic and free of real LLM calls?
- Does the nightly gate cover one canonical happy path and one adversarial path, not a full matrix?

If those answers don't match, the lane is in the wrong gate.
