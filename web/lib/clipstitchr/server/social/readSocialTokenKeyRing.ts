import type { SocialTokenKeyRing } from "../../social/types/SocialTokenKeyRing";

export function readSocialTokenKeyRing(): SocialTokenKeyRing {
  const serialized = process.env.SOCIAL_TOKEN_ENCRYPTION_KEYS;
  const currentVersion = Number(
    process.env.SOCIAL_TOKEN_ENCRYPTION_CURRENT_VERSION,
  );

  if (!serialized || !Number.isInteger(currentVersion) || currentVersion < 1) {
    throw new Error("Social token encryption is not configured.");
  }

  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(serialized) as Record<string, unknown>;
  } catch {
    throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEYS must be valid JSON.");
  }

  const keys = new Map<number, Buffer>();

  for (const [versionValue, keyValue] of Object.entries(parsed)) {
    const version = Number(versionValue);

    if (!Number.isInteger(version) || version < 1 || typeof keyValue !== "string") {
      throw new Error("Social token encryption key versions are invalid.");
    }

    const key = Buffer.from(keyValue, "base64");

    if (key.byteLength !== 32) {
      throw new Error("Every social token encryption key must be 32 bytes.");
    }

    keys.set(version, key);
  }

  if (!keys.has(currentVersion)) {
    throw new Error("The current social token encryption key is missing.");
  }

  return { currentVersion, keys };
}
