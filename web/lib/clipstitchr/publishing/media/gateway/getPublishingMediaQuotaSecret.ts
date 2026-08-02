export function getPublishingMediaQuotaSecret() {
  const quotaSecret = process.env.PUBLISHING_MEDIA_QUOTA_SECRET?.trim();

  if (!quotaSecret || Buffer.byteLength(quotaSecret, "utf8") < 32) {
    throw new Error(
      "PUBLISHING_MEDIA_QUOTA_SECRET must contain at least 32 bytes.",
    );
  }

  return quotaSecret;
}
