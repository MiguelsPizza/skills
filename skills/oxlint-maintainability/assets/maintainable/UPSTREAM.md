# Source and Attribution

The plugin structure, scope checks, tests, and installer follow [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop) at commit [13909c9e07590f5a85d93c62712259fe14a883f7](https://github.com/dmmulroy/anti-slop/tree/13909c9e07590f5a85d93c62712259fe14a883f7).

The mocking rule adapts its framework-binding checks: internal module mocks are rejected; external boundary mocks are allowed. The re-export, wrapper, and shape rules implement this repository's doctrine. Other checks use native Oxlint rules.

Keep this file and the MIT [LICENSE](LICENSE) with copied assets.
