import { decryptSocialPublishingApiKey } from "@/lib/clipstitchr/server/socialPublishing/decryptSocialPublishingApiKey";

export function getSocialPublishingApiKeyHasChanged(
  encryptedApiKey: string | undefined,
  nextApiKey: string,
) {
  if (!encryptedApiKey) {
    return false;
  }

  try {
    return decryptSocialPublishingApiKey(encryptedApiKey) !== nextApiKey.trim();
  } catch {
    return true;
  }
}
