export function getPostBridgeApiKeyEncryptionSecret() {
  const secret = process.env.POST_BRIDGE_API_KEY_ENCRYPTION_SECRET?.trim();

  if (!secret) {
    throw new Error("Missing POST_BRIDGE_API_KEY_ENCRYPTION_SECRET.");
  }

  return secret;
}
