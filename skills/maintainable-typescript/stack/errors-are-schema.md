---
example:
  primary: errors-are-schema
  format: code
  implements:
    - errors-are-schema
    - ssot-or-die
    - use-branded-scalar-types
---
# Errors Are Schema, Not Strings

**Rule:** Declare API errors in oRPC’s Zod-backed `.errors()` contracts so OpenAPI, clients, and docs derive from executable code.

See also: [Design OpenAPI for Inference](./design-openapi-for-inference.md), [SSOT or Die](../doctrine/abstractions/ssot-or-die.md), [Error Messages Are UX](../doctrine/boundaries/error-messages-are-ux.md), and [Use Branded Scalar Types](./use-branded-scalar-types.md).

## Why agents get this wrong

Message-only errors leave clients without a structured contract. Separate domain error models, HTTP mappings, oRPC conversions, and hand-written response docs multiply the places that must agree.

## What to do instead

Keep error definitions in this chain:

```text
Zod schemas
  -> oRPC input/output/error contracts
  -> OpenAPI spec
  -> generated clients and docs
```

1. Define payload schemas once in the owning domain or contracts module.
2. Declare shared errors on the base procedure.
3. Add procedure-specific failures with local `.errors(...)` calls.
4. Put summaries, descriptions, tags, and operation IDs on `.route(...)`.
5. Generate response docs from these contracts.

```typescript
import { eq } from 'drizzle-orm';
import { os } from '@orpc/server';
import { db } from '@repo/db/client';
import { installations } from '@repo/db/schema/installations';
import {
  getInstallationInputSchema,
  installationSchema,
  commonErrors,
  readInstallationErrors,
} from '@repo/contracts/installations/installation';

export const publicProcedure = os.errors(commonErrors);

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
    const installation = await db.query.installations.findFirst({
      where: eq(installations.id, input.id),
    });

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

The payload schema owns user-facing fields. The base procedure owns shared error availability; local `.errors()` calls add domain failures. Keep logging at the boundary.

Use these contracts directly throughout error handling. Do not add parallel error models or translation layers.

## Example

Contracts owner

```typescript
import { z } from 'zod';

export const installationIdSchema = z.string().min(1).brand<'InstallationId'>();

/**
 * Installation contracts owned together because they describe one aggregate.
 */
export const installationSchema = z.object({
  id: installationIdSchema,
  repositoryName: z.string().min(1),
});

export const getInstallationInputSchema = installationSchema.pick({
  id: true,
});

/**
 * Error payload returned when an installation does not exist.
 */
export const installationNotFoundErrorSchema = z.object({
  code: z.literal('installation_not_found'),
  message: z.literal('Installation not found.'),
  installationId: installationIdSchema,
});

export const internalServerErrorSchema = z.object({
  code: z.literal('internal_server_error'),
  message: z.literal('An internal error occurred.'),
  requestId: z.string(),
});

export const commonErrors = {
  INTERNAL_SERVER_ERROR: {
    data: internalServerErrorSchema,
  },
} as const;

/**
 * Reusable error contract for installation read procedures.
 * The payload schema owns the message text so it stays single-sourced.
 */
export const readInstallationErrors = {
  NOT_FOUND: {
    data: installationNotFoundErrorSchema,
  },
} as const;
```

Procedure

```typescript
import { eq } from 'drizzle-orm';
import { os } from '@orpc/server';
import { db } from '@repo/db/client';
import { installations } from '@repo/db/schema/installations';
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
    const installation = await db.query.installations.findFirst({
      where: eq(installations.id, input.id),
    });

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

Example implements: [Errors Are Schema, Not Strings](./errors-are-schema.md), [SSOT or Die](../doctrine/abstractions/ssot-or-die.md), [Use Branded Scalar Types](./use-branded-scalar-types.md).
