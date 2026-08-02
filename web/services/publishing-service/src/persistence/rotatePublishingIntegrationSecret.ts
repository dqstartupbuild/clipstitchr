import { encryptProviderToken } from "../tokens/encryptProviderToken.js";
import type { RotatePublishingIntegrationSecretInput } from "./RotatePublishingIntegrationSecretInput.js";
import { mapProviderTokenKind } from "./mapProviderTokenKind.js";
import { mapPublishingProvider } from "./mapPublishingProvider.js";

export const rotatePublishingIntegrationSecret = async (
  input: RotatePublishingIntegrationSecretInput,
) => {
  const tokenKind = mapProviderTokenKind(input.tokenKind);
  const latest =
    await input.transaction.clipPublishingIntegrationSecret.aggregate({
      where: {
        tenantId: input.tenantId,
        integrationId: input.integrationId,
        tokenKind,
      },
      _max: { version: true },
    });

  await input.transaction.clipPublishingIntegrationSecret.updateMany({
    where: {
      tenantId: input.tenantId,
      integrationId: input.integrationId,
      tokenKind,
      replacedAt: null,
    },
    data: { replacedAt: input.createdAt },
  });

  const envelope = encryptProviderToken(input.plaintextToken, input.cipherKey, {
    tenantKey: input.tenantKey,
    provider: input.provider,
    integrationId: input.integrationId,
    tokenKind: input.tokenKind,
  });

  return input.transaction.clipPublishingIntegrationSecret.create({
    data: {
      tenantId: input.tenantId,
      integrationId: input.integrationId,
      providerIdentifier: mapPublishingProvider(input.provider),
      tokenKind,
      envelope,
      version: (latest._max.version ?? 0) + 1,
      expiresAt: input.expiresAt,
      createdAt: input.createdAt,
    },
  });
};
