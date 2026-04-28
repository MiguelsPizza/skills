---
example:
  primary: module-local-webmcp-directories
  format: code
  implements:
    - module-local-webmcp-directories
    - start-here
    - thin-wrappers-over-existing-logic
---
# Module-Local WebMCP Directories

**Rule:** Put WebMCP wrappers in a `WebMCP/` directory near the feature module they instrument.

See also: [Start Here](start-here.md) and [Thin Wrappers Over Existing Logic](thin-wrappers-over-existing-logic.md).

## Why agents get this wrong

WebMCP code should be easy to find and easy to delete. A `WebMCP/` directory gives the feature one obvious integration seam.

The file shape can vary by module. Some features may register from a hook, some from a component, and some from a plain module function.

That flexibility is only about file placement and lifecycle wiring. The registration call itself should still use the first-party WebMCP surface such as `useWebMCP()` or `registerTool()`, not a second helper layer.

## What to do instead

Organize by feature or module, not by a global pile of tool files.

Good:
- `features/flights/WebMCP/read-tools.ts`
- `features/flights/WebMCP/write-tools.ts`
- `features/flights/WebMCP/hooks.ts`

Avoid:
- `src/tools/webmcp/everything.ts`
- `src/webmcp/delete-flight.ts`
- `src/webmcp/fill-flight-form.ts`

This mirrors how you would usually organize feature tests. If the module owns the behavior, the module should own the WebMCP wrapper around that behavior too.

## Example

```text
features/
  profile/
    model/
      update-profile.ts
      select-profile.ts
    ui/
      ProfileForm.tsx
    WebMCP/
      read-tools.ts
      write-tools.ts
      ProfileTools.tsx
```

Example implements: [Module-Local WebMCP Directories](module-local-webmcp-directories.md), [Start Here](start-here.md), [Thin Wrappers Over Existing Logic](thin-wrappers-over-existing-logic.md).
