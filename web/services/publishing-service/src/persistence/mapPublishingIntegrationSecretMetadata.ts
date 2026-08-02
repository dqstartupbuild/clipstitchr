import type { ClipPublishingIntegrationSecret } from "@prisma/client";

import type { PublishingIntegrationSecretMetadata } from "./PublishingIntegrationSecretMetadata.js";

export const mapPublishingIntegrationSecretMetadata = (
  secret: ClipPublishingIntegrationSecret,
): PublishingIntegrationSecretMetadata =>
  Object.freeze({
    id: secret.id,
    providerIdentifier: secret.providerIdentifier,
    tokenKind: secret.tokenKind,
    version: secret.version,
    expiresAt: secret.expiresAt,
    createdAt: secret.createdAt,
    replacedAt: secret.replacedAt,
  });
