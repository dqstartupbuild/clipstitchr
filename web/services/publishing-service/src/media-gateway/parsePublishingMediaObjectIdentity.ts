import type { PublishingMediaObjectIdentity } from "./PublishingMediaObjectIdentity.js";

export const parsePublishingMediaObjectIdentity = (
  value: string,
): PublishingMediaObjectIdentity => {
  const identity: { etag?: string; versionId?: string } = {};

  for (const part of value.split("|")) {
    if (part.startsWith("version:") && part.length > "version:".length) {
      identity.versionId = part.slice("version:".length);
    } else if (part.startsWith("etag:") && part.length > "etag:".length) {
      identity.etag = part.slice("etag:".length);
    }
  }

  return Object.freeze(identity);
};
