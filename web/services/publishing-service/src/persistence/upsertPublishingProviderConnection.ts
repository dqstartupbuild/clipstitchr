import type { PrismaClient } from "@prisma/client";

import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import type { UpsertPublishingProviderConnectionInput } from "./UpsertPublishingProviderConnectionInput.js";
import { upsertPublishingProviderConnections } from "./upsertPublishingProviderConnections.js";

export const upsertPublishingProviderConnection = async (
  database: PrismaClient,
  input: UpsertPublishingProviderConnectionInput,
) => {
  const results = await upsertPublishingProviderConnections(database, {
    tenantKey: input.tenantKey,
    connections: [input.connection],
    cipherKey: input.cipherKey,
    ...(input.connectedAt === undefined
      ? {}
      : { connectedAt: input.connectedAt }),
    ...(input.missingRefreshTokenPolicy === undefined
      ? {}
      : { missingRefreshTokenPolicy: input.missingRefreshTokenPolicy }),
  });
  const result = results[0];

  if (result === undefined) {
    throw new PublishingPersistenceValidationError("connection");
  }

  return result;
};
