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

**Rule:** Generate OpenAPI, clients, and docs from executable oRPC contracts.

See also: [SSOT or Die](../doctrine/abstractions/ssot-or-die.md), [Errors Are Schema, Not Strings](./errors-are-schema.md), and [Use Canonical Named Types, Not Inline Object Shapes](./use-canonical-named-types.md).

## Why agents get this wrong

Hand-maintained OpenAPI files and response descriptions drift from handlers. Generated clients then describe a different contract from the one the server implements.

## What to do instead

Keep the API contract in this inference chain:

```text
Drizzle schema / canonical Zod schema
  -> oRPC input/output/error contracts
  -> route metadata and middleware spec
  -> generated OpenAPI spec
  -> generated clients and reference docs
```

Use the oRPC contract builders:

- `.input(...)` for request validation and schema
- `.output(...)` for response validation and schema
- `.errors(...)` for structured error responses
- `.route(...)` for path, method, summary, description, tags, and operation ID
- OpenAPI plugins and handlers for publishing the spec

Reserve manual OpenAPI configuration for top-level metadata and narrow extensions the contract cannot express. Put response shapes and error definitions in the contract so changes update the spec, clients, and docs automatically.

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

Example implements: [Design OpenAPI for Inference](./design-openapi-for-inference.md), [SSOT or Die](../doctrine/abstractions/ssot-or-die.md), [Errors Are Schema, Not Strings](./errors-are-schema.md).
