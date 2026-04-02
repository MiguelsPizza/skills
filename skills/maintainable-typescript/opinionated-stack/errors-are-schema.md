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

**Rule:** Every API error belongs in a Zod-backed `.errors()` contract. Define it once, reuse it directly, and do not build parallel error-class or conversion systems.

See also: [SSOT or Die](../references/ssot-or-die.md), [Error Messages Are UX](../references/error-messages-are-ux.md), and [Use Branded Scalar Types](use-branded-scalar-types.md).

## Why agents get this wrong

Agents often throw plain `Error` objects or ad-hoc `ORPCError` instances with only a message. That gives humans a string but gives OpenAPI, generated clients, and AI tool consumers no structured contract.

The other common failure is ceremony: domain error classes, an error-to-HTTP mapping layer, then an oRPC conversion layer. That creates multiple representations of the same failure that will drift.

## What to do instead

Define error entries once as Zod-backed objects, compose them into reusable sets, attach those sets directly to `.errors()`, and throw them through oRPC's typed `errors` helpers.

Most repo examples can assume the house `publicProcedure` already exposes typed `errors` helpers. This opinion is the exception: here the local `.errors(...)` contract should be explicit because the point is to show where those helpers come from.

```typescript
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@repo/db/client';
import { installations } from '@repo/db/schema/installations';
import {
  getInstallationInputSchema,
  installationSchema,
} from '@repo/shared-types/installations/installation';

export const installationIdSchema = z.string().min(1).brand<'InstallationId'>();
export type InstallationId = z.infer<typeof installationIdSchema>;

export const errorSchemas = {
  INTERNAL_SERVER_ERROR: {
    message: 'An internal error occurred.',
    data: z.object({
      requestId: z.string(),
    }),
  },
  NOT_FOUND: {
    message: 'Resource not found',
    data: z.object({
      resource: z.string(),
      id: installationIdSchema,
    }).meta({
      examples: [{ resource: 'installation', id: 'inst_abc123' }],
    }),
  },
} as const;

export const readErrors = {
  INTERNAL_SERVER_ERROR: errorSchemas.INTERNAL_SERVER_ERROR,
  NOT_FOUND: errorSchemas.NOT_FOUND,
} as const;

export const getInstallation = publicProcedure
  .input(getInstallationInputSchema)
  .output(installationSchema)
  .errors(readErrors)
  .handler(async ({ input, errors }) => {
    const installation = await db.query.installations.findFirst({
      where: eq(installations.id, input.installationId),
    });

    if (!installation) {
      throw errors.NOT_FOUND({
        data: {
          resource: 'installation',
          id: input.installationId,
        },
      });
    }

    return installation;
  });
```

Keep the user-facing wording in the error schema and the operational logging in the boundary code. Do not add a separate `toORPCError` translation file.

## Example

Shared types owner

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

/**
 * Reusable error contract for installation read procedures.
 */
export const readInstallationErrors = {
  NOT_FOUND: {
    message: 'Installation not found.',
    data: installationNotFoundErrorSchema,
  },
} as const;
```

Procedure

```typescript
import { eq } from 'drizzle-orm';
import { db } from '@repo/db/client';
import { installations } from '@repo/db/schema/installations';
import {
  getInstallationInputSchema,
  installationSchema,
  readInstallationErrors,
} from '@repo/shared-types/installations/installation';
import { publicProcedure } from '../orpc';

export const getInstallation = publicProcedure
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

Example implements: [Errors Are Schema, Not Strings](errors-are-schema.md), [SSOT or Die](../references/ssot-or-die.md), [Use Branded Scalar Types](use-branded-scalar-types.md).
