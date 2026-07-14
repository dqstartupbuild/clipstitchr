import { createEmailConfirmationSignature } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationSignature";
import { createEmailConfirmationTokenDigest } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationTokenDigest";
import { getConstantTimeStringsAreEqual } from "@/lib/clipstitchr/email/confirmation/getConstantTimeStringsAreEqual";

const tokenRecordIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const signaturePattern = /^[A-Za-z0-9_-]{43}$/;

export async function verifyEmailConfirmationUrl(
  requestUrl: string | URL,
  signingSecret = process.env.EMAIL_CONFIRMATION_TOKEN_SECRET,
) {
  if (!signingSecret?.trim()) return null;

  const url =
    typeof requestUrl === "string" ? new URL(requestUrl) : requestUrl;
  const tokenRecordIds = url.searchParams.getAll("id");
  const expirations = url.searchParams.getAll("expires");
  const signatures = url.searchParams.getAll("signature");

  if (
    tokenRecordIds.length !== 1 ||
    expirations.length !== 1 ||
    signatures.length !== 1
  ) {
    return null;
  }

  const [tokenRecordId] = tokenRecordIds;
  const [expiration] = expirations;
  const [signature] = signatures;
  const expiresAt = Number(expiration);

  if (
    !tokenRecordIdPattern.test(tokenRecordId) ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= 0 ||
    !signaturePattern.test(signature)
  ) {
    return null;
  }

  const expectedSignature = await createEmailConfirmationSignature(
    tokenRecordId,
    expiresAt,
    signingSecret,
  );

  if (!getConstantTimeStringsAreEqual(signature, expectedSignature)) {
    return null;
  }

  return {
    expiresAt,
    tokenDigest: await createEmailConfirmationTokenDigest(signature),
    tokenRecordId,
  };
}
