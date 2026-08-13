import { normalizePublishingMediaPublicOrigin } from "@/lib/clipstitchr/publishing/media/gateway/normalizePublishingMediaPublicOrigin";

export function getPublishingMediaPublicOrigin() {
  const configuredOrigin = process.env.STUDIO_PUBLISHING_MEDIA_PUBLIC_ORIGIN;

  if (!configuredOrigin) {
    throw new Error("Missing STUDIO_PUBLISHING_MEDIA_PUBLIC_ORIGIN.");
  }

  return normalizePublishingMediaPublicOrigin(configuredOrigin);
}
