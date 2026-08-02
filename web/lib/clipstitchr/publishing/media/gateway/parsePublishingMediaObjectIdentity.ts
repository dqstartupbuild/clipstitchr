import type { PublishingMediaObjectIdentity } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaObjectIdentity";

export function parsePublishingMediaObjectIdentity(
  version: string | undefined,
): PublishingMediaObjectIdentity {
  const identity: PublishingMediaObjectIdentity = {};

  for (const part of version?.split("|") ?? []) {
    if (part.startsWith("version:") && part.length > "version:".length) {
      identity.versionId = part.slice("version:".length);
    } else if (part.startsWith("etag:") && part.length > "etag:".length) {
      identity.etag = part.slice("etag:".length);
    }
  }

  return identity;
}
