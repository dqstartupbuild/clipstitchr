import type { PublishingIntegrationRecord } from "./PublishingIntegrationRecord.js";
import type { PublishingIntegrationView } from "./PublishingIntegrationView.js";
import type { PublicPublishingProvider } from "./PublicPublishingProvider.js";
import { readPublishingIntegrationAvatarUrl } from "./readPublishingIntegrationAvatarUrl.js";
import { readPublishingIntegrationUsername } from "./readPublishingIntegrationUsername.js";

export const mapPublishingIntegrationRecord = (
  record: PublishingIntegrationRecord,
  provider: PublicPublishingProvider,
  now: Date,
): PublishingIntegrationView => {
  const isExpired =
    record.tokenExpiration !== null &&
    record.tokenExpiration.getTime() <= now.getTime();
  const needsAttention = record.disabled || record.refreshNeeded || isExpired;
  const displayName = record.name.trim();
  const hasSafeDisplayName =
    displayName.length >= 1 &&
    displayName.length <= 200 &&
    !/[\u0000-\u001f\u007f]/u.test(displayName);

  return Object.freeze({
    avatarUrl: readPublishingIntegrationAvatarUrl(record.picture),
    displayName: hasSafeDisplayName ? displayName : "Connected account",
    expiresAt: record.tokenExpiration?.toISOString() ?? null,
    id: record.id,
    provider,
    status: needsAttention ? "needs-attention" : "connected",
    statusMessage: needsAttention
      ? "Reconnect this account to keep publishing."
      : null,
    username: readPublishingIntegrationUsername(record.profile),
  });
};
