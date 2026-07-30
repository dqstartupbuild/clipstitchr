import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyTikTokWebhookSignature({
  body,
  header,
  nowMs = Date.now(),
}: {
  body: string;
  header: string | null;
  nowMs?: number;
}) {
  const secret = process.env.TIKTOK_CLIENT_SECRET?.trim();

  if (!secret || !header) {
    return false;
  }

  const parts = Object.fromEntries(
    header.split(",").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, value.join("=")];
    }),
  );
  const timestamp = Number(parts.t);
  const signature = parts.s;

  if (
    !Number.isFinite(timestamp) ||
    !signature ||
    Math.abs(nowMs - timestamp * 1000) > 5 * 60_000
  ) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`, "utf8")
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");

  return (
    expectedBuffer.byteLength === actualBuffer.byteLength &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}
