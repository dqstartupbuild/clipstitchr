import { createHash } from "node:crypto";
import type { ResolvedPublishingMediaSource } from "@/lib/clipstitchr/publishing/media/ResolvedPublishingMediaSource";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";

export function createPublishingMediaDeduplicationKey(
  tenantKey: string,
  source: ResolvedPublishingMediaSource,
) {
  const normalizedTenantKey = tenantKey.trim();

  if (!normalizedTenantKey || normalizedTenantKey.length > 256) {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "Publishing media requires a stable tenant key.",
    );
  }

  const identity = JSON.stringify([
    "v1",
    normalizedTenantKey,
    source.kind,
    source.recordId,
    source.mediaObjects.map((mediaObject) => [
      mediaObject.objectKey,
      mediaObject.version ?? null,
      mediaObject.checksum ?? null,
    ]),
  ]);
  const digest = createHash("sha256").update(identity).digest("hex");

  return `publishing-media:v1:${digest}`;
}
