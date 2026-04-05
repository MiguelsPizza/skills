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

**Rule:** API errors must be declared in oRPC's Zod-backed `.errors()` contracts so OpenAPI, clients, and docs are inferred from executable code instead of maintained in parallel.

See also: [Design OpenAPI for Inference](design-openapi-for-inference.md), [SSOT or Die](../references/ssot-or-die.md), [Error Messages Are UX](../references/error-messages-are-ux.md), and [Use Branded Scalar Types](use-branded-scalar-types.md).

## Why agents get this wrong

Agents often treat errors as implementation detail instead of API contract. They throw plain `Error` objects or ad-hoc `ORPCError` instances with only a message. That gives humans a string, but it gives OpenAPI, generated clients, and AI tool consumers no structured response contract to infer from.

The other common failure is parallel systems: domain error classes, an error-to-HTTP mapping layer, an oRPC conversion layer, and then hand-written OpenAPI prose explaining what the endpoint "really" returns. That turns one failure mode into multiple representations that will drift.

Once the inference chain is broken, the team starts maintaining the spec by hand:

- docs say one thing
- thrown errors say another
- generated clients only know part of the shape
- operation metadata and error responses stop matching reality

## What to do instead

The point of this stack is not merely "typed errors." The point is to get the best possible OpenAPI spec from the code you already have to write. The broader doctrine lives in [Design OpenAPI for Inference](design-openapi-for-inference.md). This file is the error-contract slice of that rule.

That means the owning chain should look like this:

```text
Zod schemas
  -> oRPC input/output/error contracts
  -> OpenAPI spec
  -> generated clients and docs
```

Design for that chain directly:

1. Define error payload schemas once in the owning domain/contracts module.
2. Put cross-cutting errors on the base procedure.
3. Add local `.errors(...)` only when a procedure needs extra domain-specific failures.
4. Put operation metadata on `.route(...)` so summaries, descriptions, tags, and operation IDs also flow into the generated spec.
5. Do not maintain a second error model just to satisfy runtime code or documentation.

This matches oRPC's own builder model: start from a base procedure, inherit shared errors, and add local `.errors(...)` only for the contract that belongs to one procedure or domain.

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

Here, the request shape, success shape, error shape, path, summary, description, and operation ID all live in code that oRPC can use to generate the spec. That is the goal.

The payload schema is the source of truth for user-facing error fields. The base procedure owns shared error availability. The local `.errors()` call owns only the extra domain contract for this procedure. `.route(...)` owns the operation metadata for the generated spec. Keep operational logging in the boundary code, and do not add a separate `toORPCError` translation file.

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

Example implements: [Errors Are Schema, Not Strings](errors-are-schema.md), [SSOT or Die](../references/ssot-or-die.md), [Use Branded Scalar Types](use-branded-scalar-types.md).

## The failure mode to avoid

Do not do this:

- define Effect or domain error classes as the "real" source of truth
- convert them in a separate `toORPCError` layer
- keep `.errors()` declarations as a thin mirror just for type satisfaction
- document responses manually in prose because the generated spec is incomplete

That architecture admits the real problem: the contract the client needs is not actually the contract the server owns.

## The test

Ask:

- If I change an error field or message, will the generated OpenAPI spec update automatically?
- If I add a new error case, will the client infer it from `.errors()` without sidecar work?
- If I rename an operation or rewrite its description, does that change happen in `.route(...)` instead of in a separate OpenAPI file?
- Is any response shape described manually that oRPC could infer from the contract?

If the answer to those questions is no, the inference chain is broken.
