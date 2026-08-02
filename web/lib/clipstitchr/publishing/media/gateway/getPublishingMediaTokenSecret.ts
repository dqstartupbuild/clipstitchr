export function getPublishingMediaTokenSecret() {
  const tokenSecret = process.env.PUBLISHING_MEDIA_TOKEN_SECRET?.trim();

  if (!tokenSecret || Buffer.byteLength(tokenSecret, "utf8") < 32) {
    throw new Error(
      "PUBLISHING_MEDIA_TOKEN_SECRET must contain at least 32 bytes.",
    );
  }

  return tokenSecret;
}
