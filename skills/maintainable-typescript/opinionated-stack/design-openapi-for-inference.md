---
example:
  primary: design-openapi-for-inference
  format: code
  implements:
    - design-openapi-for-inference
    - ssot-or-die
    - errors-are-schema
---
# Design OpenAPI for Inference

**Rule:** Treat the OpenAPI spec as an inferred artifact, not a hand-maintained source of truth. Design the API contract in executable code so oRPC can generate the spec, clients, and docs from the same definitions.

See also: [SSOT or Die](../references/ssot-or-die.md), [Errors Are Schema, Not Strings](errors-are-schema.md), and [Use Canonical Named Types, Not Inline Object Shapes](use-canonical-named-types.md).

## Why agents get this wrong

Agents often treat OpenAPI as a documentation afterthought. They wire up handlers first, then patch in route metadata, hand-write response descriptions, or maintain a sidecar OpenAPI file because the generated spec is missing details.

That creates two sources of truth:

- the API layer describes what the server really does
- the OpenAPI layer describes what the docs say it does

Once those drift, the generated clients, docs, and runtime behavior stop agreeing. A stack that claims SSOT cannot accept one truth for code and another for the spec.

## What to do instead

Design the API around the inference chain:

```text
Drizzle schema / canonical Zod schema
  -> oRPC input/output/error contracts
  -> route metadata and middleware spec
  -> generated OpenAPI spec
  -> generated clients and reference docs
```

This is why the stack uses oRPC. The contract surface is already the documentation surface:

- `.input(...)` owns request validation and request schema
- `.output(...)` owns response validation and response schema
- `.errors(...)` owns structured error responses
- `.route(...)` owns path, method, summary, description, tags, and operation ID
- OpenAPI plugins and handlers turn that contract into the published spec

Manual OpenAPI YAML, manual response shape prose, and sidecar error documentation should be rare. Use manual OpenAPI config only for top-level spec metadata or narrow extensions that the contract system cannot express.

If you are about to document a response shape by hand, stop and ask whether the contract should own it instead.

## Example

Shared contracts

```typescript
import { z } from 'zod';

export const installationIdSchema = z.string().min(1).brand<'InstallationId'>();

export const installationSchema = z.object({
  id: installationIdSchema,
  repositoryName: z.string().min(1),
});

export const getInstallationInputSchema = installationSchema.pick({
  id: true,
});

export const installationNotFoundErrorSchema = z.object({
  code: z.literal('installation_not_found'),
  message: z.literal('Installation not found.'),
  installationId: installationIdSchema,
});

export const commonErrors = {
  INTERNAL_SERVER_ERROR: {
    data: z.object({
      code: z.literal('internal_server_error'),
      message: z.literal('An internal error occurred.'),
      requestId: z.string(),
    }),
  },
} as const;

export const readInstallationErrors = {
  NOT_FOUND: {
    data: installationNotFoundErrorSchema,
  },
} as const;
```

Procedure

```typescript
import { os } from '@orpc/server';
import {
  commonErrors,
  getInstallationInputSchema,
  installationSchema,
  readInstallationErrors,
} from '@repo/contracts/installations/installation';

const publicProcedure = os.errors(commonErrors);

export const getInstallation = publicProcedure
  .route({
    method: 'GET',
    path: '/installations/{id}',
    summary: 'Get installation',
    description: 'Return a single installation by ID.',
    operationId: 'installations_get',
    tags: ['Installations'],
  })
  .input(getInstallationInputSchema)
  .output(installationSchema)
  .errors(readInstallationErrors)
  .handler(async ({ input, errors }) => {
    const installation = await loadInstallation(input.id);

    if (!installation) {
      throw errors.NOT_FOUND({
        data: {
          code: 'installation_not_found',
          message: 'Installation not found.',
          installationId: input.id,
        },
      });
    }

    return installation;
  });
```

OpenAPI publishing

```typescript
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';

export const openApiPlugin = new OpenAPIReferencePlugin({
  docsPath: '/docs',
  specPath: '/spec.json',
  docsProvider: 'scalar',
  schemaConverters: [new ZodToJsonSchemaConverter()],
  specGenerateOptions: {
    info: {
      title: 'Example API',
      version: '1.0.0',
    },
  },
});
```

Example implements: [Design OpenAPI for Inference](design-openapi-for-inference.md), [SSOT or Die](../references/ssot-or-die.md), [Errors Are Schema, Not Strings](errors-are-schema.md).

## The test

Ask:

- If I change a field in the contract, does the OpenAPI spec update automatically?
- If I add an error case, do the docs and clients learn it from `.errors(...)`?
- If I rename or re-describe an endpoint, does that happen in `.route(...)` instead of a sidecar spec file?
- Am I maintaining any manual OpenAPI description for data the contract could already express?

If the answer to those questions is no, the inference chain is broken.
