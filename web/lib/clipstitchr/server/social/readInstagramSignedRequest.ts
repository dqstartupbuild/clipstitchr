import { createHmac, timingSafeEqual } from "node:crypto";

export function readInstagramSignedRequest(signedRequest: string) {
  const secret = process.env.INSTAGRAM_CLIENT_SECRET?.trim();
  const [encodedSignature, encodedPayload] = signedRequest.split(".");

  if (!secret || !encodedSignature || !encodedPayload) {
    throw new Error("Instagram signed request is invalid.");
  }

  const expected = createHmac("sha256", secret)
    .update(encodedPayload, "utf8")
    .digest();
  const actual = Buffer.from(encodedSignature, "base64url");

  if (
    expected.byteLength !== actual.byteLength ||
    !timingSafeEqual(expected, actual)
  ) {
    throw new Error("Instagram signed request could not be verified.");
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8"),
  ) as { user_id?: string };

  if (!payload.user_id) {
    throw new Error("Instagram signed request has no account.");
  }

  return { user_id: payload.user_id };
}
