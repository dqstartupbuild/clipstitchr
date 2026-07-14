import { decodeBase64Bytes } from "./decodeBase64Bytes";
import { getConstantTimeByteArraysAreEqual } from "./getConstantTimeByteArraysAreEqual";

const MAX_WEBHOOK_AGE_SECONDS = 5 * 60;

type VerifyLoopsWebhookSignatureOptions = Readonly<{
  eventId: string;
  nowSeconds: number;
  rawBody: string;
  signatureHeader: string;
  signingSecret: string;
  timestamp: string;
}>;

export async function verifyLoopsWebhookSignature({
  eventId,
  nowSeconds,
  rawBody,
  signatureHeader,
  signingSecret,
  timestamp,
}: VerifyLoopsWebhookSignatureOptions) {
  if (!/^[0-9]+$/.test(timestamp)) return false;

  const timestampSeconds = Number(timestamp);

  if (
    !eventId ||
    !Number.isSafeInteger(timestampSeconds) ||
    Math.abs(nowSeconds - timestampSeconds) > MAX_WEBHOOK_AGE_SECONDS
  ) {
    return false;
  }

  const separatorIndex = signingSecret.indexOf("_");

  if (separatorIndex < 1 || separatorIndex === signingSecret.length - 1) {
    return false;
  }

  try {
    const keyBytes = decodeBase64Bytes(
      signingSecret.slice(separatorIndex + 1),
    );
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { hash: "SHA-256", name: "HMAC" },
      false,
      ["sign"],
    );
    const signedContent = `${eventId}.${timestamp}.${rawBody}`;
    const expectedSignature = new Uint8Array(
      await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(signedContent),
      ),
    );

    return signatureHeader.split(" ").some((entry) => {
      const [version, encodedSignature, unexpected] = entry.split(",");

      if (version !== "v1" || !encodedSignature || unexpected) {
        return false;
      }

      try {
        return getConstantTimeByteArraysAreEqual(
          decodeBase64Bytes(encodedSignature),
          expectedSignature,
        );
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}
