import type { PrismaClient } from "@prisma/client";

import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { CreatePublishingIntegrationInput } from "./CreatePublishingIntegrationInput.js";
import { acquirePublishingAdvisoryLock } from "./acquirePublishingAdvisoryLock.js";
import { assertPublishingDisplayName } from "./assertPublishingDisplayName.js";
import { assertPublishingOptionalDate } from "./assertPublishingOptionalDate.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { assertPublishingPictureUrl } from "./assertPublishingPictureUrl.js";
import { assertPublishingUsername } from "./assertPublishingUsername.js";
import { createPublishingIntegrationSettings } from "./createPublishingIntegrationSettings.js";
import { findPublishingTenantOrThrow } from "./findPublishingTenantOrThrow.js";
import { managedIntegrationTokenMarker } from "./managedIntegrationTokenMarker.js";
import { normalizePublishingGrantedScopes } from "./normalizePublishingGrantedScopes.js";

export const createPublishingIntegration = async (
  database: PrismaClient,
  input: CreatePublishingIntegrationInput,
) => {
  assertPublishingPersistenceIdentifier(input.internalId, "internalId");
  assertPublishingDisplayName(input.name, "name");
  assertPublishingOptionalDate(
    input.accessTokenExpiresAt,
    "accessTokenExpiresAt",
  );
  assertPublishingOptionalDate(
    input.refreshTokenExpiresAt,
    "refreshTokenExpiresAt",
  );

  if (input.pictureUrl !== undefined && input.pictureUrl !== null) {
    assertPublishingPictureUrl(input.pictureUrl);
  }

  if (input.username !== undefined && input.username !== null) {
    assertPublishingUsername(input.username);
  }

  const grantedScopes =
    input.grantedScopes === undefined
      ? undefined
      : normalizePublishingGrantedScopes(input.grantedScopes);

  return database.$transaction(async (transaction) => {
    const tenant = await findPublishingTenantOrThrow(
      transaction,
      input.tenantKey,
    );
    await acquirePublishingAdvisoryLock(
      transaction,
      `publishing-integration:${tenant.id}:${input.internalId}`,
    );
    const existing = await transaction.integration.findUnique({
      where: {
        organizationId_internalId: {
          organizationId: tenant.organizationId,
          internalId: input.internalId,
        },
      },
    });

    if (
      existing !== null &&
      (existing.providerIdentifier !== input.provider ||
        existing.type !== input.provider)
    ) {
      throw new PublishingResourceOwnershipError();
    }

    const shouldUpdateSettings =
      grantedScopes !== undefined || input.refreshTokenExpiresAt !== undefined;
    const additionalSettings = createPublishingIntegrationSettings({
      existingValue: existing?.additionalSettings ?? null,
      ...(grantedScopes === undefined ? {} : { grantedScopes }),
      ...(input.refreshTokenExpiresAt === undefined
        ? {}
        : { refreshTokenExpiresAt: input.refreshTokenExpiresAt }),
    });
    const profile =
      input.username === undefined
        ? undefined
        : input.username === null
          ? null
          : JSON.stringify({
              schemaVersion: 1,
              username: input.username.trim(),
            });

    return transaction.integration.upsert({
      where: {
        organizationId_internalId: {
          organizationId: tenant.organizationId,
          internalId: input.internalId,
        },
      },
      create: {
        internalId: input.internalId,
        organizationId: tenant.organizationId,
        name: input.name.trim(),
        picture: input.pictureUrl?.trim() ?? null,
        providerIdentifier: input.provider,
        type: input.provider,
        token: managedIntegrationTokenMarker,
        refreshToken: null,
        tokenExpiration: input.accessTokenExpiresAt ?? null,
        profile: profile ?? null,
        additionalSettings,
      },
      update: {
        name: input.name.trim(),
        ...(input.pictureUrl === undefined
          ? {}
          : { picture: input.pictureUrl?.trim() ?? null }),
        ...(input.accessTokenExpiresAt === undefined
          ? {}
          : { tokenExpiration: input.accessTokenExpiresAt }),
        ...(profile === undefined ? {} : { profile }),
        ...(shouldUpdateSettings ? { additionalSettings } : {}),
        token: managedIntegrationTokenMarker,
        refreshToken: null,
        disabled: false,
        deletedAt: null,
        refreshNeeded: false,
        inBetweenSteps: false,
      },
    });
  });
};
