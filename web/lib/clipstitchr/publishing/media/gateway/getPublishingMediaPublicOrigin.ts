import { normalizePublishingMediaPublicOrigin } from "@/lib/clipstitchr/publishing/media/gateway/normalizePublishingMediaPublicOrigin";

export function getPublishingMediaPublicOrigin() {
  const configuredOrigin = process.env.PUBLISHING_MEDIA_PUBLIC_ORIGIN;

  if (!configuredOrigin) {
    throw new Error("Missing PUBLISHING_MEDIA_PUBLIC_ORIGIN.");
  }

  return normalizePublishingMediaPublicOrigin(configuredOrigin);
}
