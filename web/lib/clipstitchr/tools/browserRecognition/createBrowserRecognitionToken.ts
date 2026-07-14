import { encodeBase64Url } from "../../crypto/encodeBase64Url";

export function createBrowserRecognitionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));

  return encodeBase64Url(bytes);
}
