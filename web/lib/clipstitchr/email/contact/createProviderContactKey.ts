import { encodeBase64Url } from "../../crypto/encodeBase64Url";

export function createProviderContactKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));

  return encodeBase64Url(bytes);
}
