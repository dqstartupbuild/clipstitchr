import { createSha256HexDigest } from "../../crypto/createSha256HexDigest";

export async function createEmailConfirmationTokenDigest(signature: string) {
  return await createSha256HexDigest(signature);
}
