import { createSha256HexDigest } from "../../crypto/createSha256HexDigest";

export async function hashBrowserRecognitionToken(token: string) {
  return await createSha256HexDigest(token);
}
