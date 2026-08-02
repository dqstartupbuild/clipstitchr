import { PublishingPersistenceValidationError } from "../errors/PublishingPersistenceValidationError.js";
import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { PersistPublishingProviderConnectionInput } from "./PersistPublishingProviderConnectionInput.js";
import { assertPublishingDisplayName } from "./assertPublishingDisplayName.js";
import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";
import { assertPublishingPictureUrl } from "./assertPublishingPictureUrl.js";
import { assertPublishingUsername } from "./assertPublishingUsername.js";
import { createPublishingCredentialExpiration } from "./createPublishingCredentialExpiration.js";
import { createPublishingIntegrationSettings } from "./createPublishingIntegrationSettings.js";
import { managedIntegrationTokenMarker } from "./managedIntegrationTokenMarker.js";
import { mapPublishingIntegrationSecretMetadata } from "./mapPublishingIntegrationSecretMetadata.js";
import { normalizePublishingGrantedScopes } from "./normalizePublishingGrantedScopes.js";
import { publishingIntegrationSafeSelect } from "./publishingIntegrationSafeSelect.js";
import { rotatePublishingIntegrationSecret } from "./rotatePublishingIntegrationSecret.js";

export const persistPublishingProviderConnection = async (
  input: PersistPublishingProviderConnectionInput,
) => {
  const { connection } = input;

  assertPublishingPersistenceIdentifier(connection.accountId, "accountId");
  assertPublishingDisplayName(connection.accountName, "accountName");

  if (!Number.isSafeInteger(input.connectedAt.getTime())) {
    throw new PublishingPersistenceValidationError("connectedAt");
  }

  if (
    input.missingRefreshTokenPolicy !== "preserve" &&
    input.missingRefreshTokenPolicy !== "revoke"
  ) {
    throw new PublishingPersistenceValidationError("missingRefreshTokenPolicy");
  }

  if (connection.username !== undefined) {
    assertPublishingUsername(connection.username);
  }

  if (connection.pictureUrl !== undefined) {
    assertPublishingPictureUrl(connection.pictureUrl);
  }

  if (
    connection.refreshToken === undefined &&
    connection.refreshExpiresInSeconds !== undefined
  ) {
    throw new PublishingPersistenceValidationError("refreshExpiresInSeconds");
  }

  const grantedScopes = normalizePublishingGrantedScopes(connection.scopes);
  const accessTokenExpiresAt = createPublishingCredentialExpiration(
    input.connectedAt,
    connection.expiresInSeconds,
    "expiresInSeconds",
  );
  const refreshTokenExpiresAt = createPublishingCredentialExpiration(
    input.connectedAt,
    connection.refreshExpiresInSeconds,
    "refreshExpiresInSeconds",
  );
  const existing = await input.transaction.integration.findUnique({
    where: {
      organizationId_internalId: {
        organizationId: input.organizationId,
        internalId: connection.accountId,
      },
    },
  });

  if (
    existing !== null &&
    (existing.providerIdentifier !== connection.provider ||
      existing.type !== connection.provider)
  ) {
    throw new PublishingResourceOwnershipError();
  }

  const shouldReplaceRefreshMetadata =
    connection.refreshToken !== undefined ||
    input.missingRefreshTokenPolicy === "revoke";
  const additionalSettings = createPublishingIntegrationSettings({
    existingValue: existing?.additionalSettings ?? null,
    grantedScopes,
    ...(shouldReplaceRefreshMetadata ? { refreshTokenExpiresAt } : {}),
  });
  const profile =
    connection.username === undefined
      ? undefined
      : JSON.stringify({
          schemaVersion: 1,
          username: connection.username.trim(),
        });
  const integration = await input.transaction.integration.upsert({
    where: {
      organizationId_internalId: {
        organizationId: input.organizationId,
        internalId: connection.accountId,
      },
    },
    create: {
      internalId: connection.accountId,
      organizationId: input.organizationId,
      name: connection.accountName.trim(),
      picture: connection.pictureUrl?.trim() ?? null,
      providerIdentifier: connection.provider,
      type: connection.provider,
      token: managedIntegrationTokenMarker,
      refreshToken: null,
      tokenExpiration: accessTokenExpiresAt,
      profile: profile ?? null,
      additionalSettings,
    },
    update: {
      name: connection.accountName.trim(),
      ...(connection.pictureUrl === undefined
        ? {}
        : { picture: connection.pictureUrl.trim() }),
      token: managedIntegrationTokenMarker,
      refreshToken: null,
      tokenExpiration: accessTokenExpiresAt,
      ...(profile === undefined ? {} : { profile }),
      additionalSettings,
      disabled: false,
      deletedAt: null,
      refreshNeeded: false,
      inBetweenSteps: false,
    },
    select: publishingIntegrationSafeSelect,
  });
  const accessSecret = await rotatePublishingIntegrationSecret({
    transaction: input.transaction,
    tenantId: input.tenantId,
    tenantKey: input.tenantKey,
    integrationId: integration.id,
    provider: connection.provider,
    tokenKind: "access",
    plaintextToken: connection.accessToken,
    cipherKey: input.cipherKey,
    expiresAt: accessTokenExpiresAt,
    createdAt: input.connectedAt,
  });
  let refreshSecret: Awaited<
    ReturnType<typeof rotatePublishingIntegrationSecret>
  > | null = null;

  if (connection.refreshToken !== undefined) {
    refreshSecret = await rotatePublishingIntegrationSecret({
      transaction: input.transaction,
      tenantId: input.tenantId,
      tenantKey: input.tenantKey,
      integrationId: integration.id,
      provider: connection.provider,
      tokenKind: "refresh",
      plaintextToken: connection.refreshToken,
      cipherKey: input.cipherKey,
      expiresAt: refreshTokenExpiresAt,
      createdAt: input.connectedAt,
    });
  } else if (input.missingRefreshTokenPolicy === "revoke") {
    await input.transaction.clipPublishingIntegrationSecret.updateMany({
      where: {
        tenantId: input.tenantId,
        integrationId: integration.id,
        tokenKind: "REFRESH",
        replacedAt: null,
      },
      data: { replacedAt: input.connectedAt },
    });
  }

  return Object.freeze({
    integration,
    accessSecret: mapPublishingIntegrationSecretMetadata(accessSecret),
    refreshSecret:
      refreshSecret === null
        ? null
        : mapPublishingIntegrationSecretMetadata(refreshSecret),
  });
};
