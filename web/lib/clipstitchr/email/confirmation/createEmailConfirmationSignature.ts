import { encodeBase64Url } from "../../crypto/encodeBase64Url";

export async function createEmailConfirmationSignature(
  tokenRecordId: string,
  expiresAt: number,
  signingSecret: string,
) {
  if (!signingSecret.trim()) {
    throw new Error("Email confirmation is not configured.");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingSecret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`v1.${tokenRecordId}.${expiresAt}`),
  );

  return encodeBase64Url(signature);
}
