import { decryptPostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/decryptPostBridgeApiKey";

export function getPostBridgeApiKeyHasChanged(
  encryptedApiKey: string | undefined,
  nextApiKey: string,
) {
  if (!encryptedApiKey) {
    return false;
  }

  try {
    return decryptPostBridgeApiKey(encryptedApiKey) !== nextApiKey.trim();
  } catch {
    return true;
  }
}
