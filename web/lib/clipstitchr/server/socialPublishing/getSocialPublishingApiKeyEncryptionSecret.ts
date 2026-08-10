export function getSocialPublishingApiKeyEncryptionSecret() {
  const secret =
    process.env.SOCIAL_PUBLISHING_API_KEY_ENCRYPTION_SECRET?.trim() ||
    process.env.POST_BRIDGE_API_KEY_ENCRYPTION_SECRET?.trim();

  if (!secret) {
    throw new Error("Missing SOCIAL_PUBLISHING_API_KEY_ENCRYPTION_SECRET.");
  }

  return secret;
}
