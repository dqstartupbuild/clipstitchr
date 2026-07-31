import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyInstagramWebhookSignature(
  body: string,
  header: string | null,
) {
  const secret = process.env.INSTAGRAM_CLIENT_SECRET?.trim();

  if (!secret || !header?.startsWith("sha256=")) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("hex");
  const actual = header.slice("sha256=".length);
  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(actual, "utf8");

  return (
    expectedBuffer.byteLength === actualBuffer.byteLength &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}
