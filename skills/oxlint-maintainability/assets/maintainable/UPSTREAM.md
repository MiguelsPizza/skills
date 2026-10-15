# Source and Attribution

The Oxlint plugin shape, lexical scope approach, RuleTester workflow, and copy-to-repository skill delivery were informed by [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop) at commit [13909c9e07590f5a85d93c62712259fe14a883f7](https://github.com/dmmulroy/anti-slop/tree/13909c9e07590f5a85d93c62712259fe14a883f7).

The internal module-mocking rule adapts that project's framework-binding checks to this repository's policy: internal modules cannot be mocked; external boundaries remain mockable. The re-export and review rules implement this repository's own doctrine. Native Oxlint rules provide the remaining enforcement.

The upstream MIT notice is retained in [LICENSE](LICENSE). Keep both files with copied plugin assets.
