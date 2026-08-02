import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import type { VerifiedTikTokWebhook } from "./VerifiedTikTokWebhook.js";

const MAX_TIKTOK_WEBHOOK_BYTES = 1_048_576;

export const verifyTikTokWebhook = (
  rawBody: Uint8Array,
  signatureHeader: string,
  clientSecret: string,
  nowEpochMilliseconds = Date.now(),
  maximumAgeSeconds = 300,
): VerifiedTikTokWebhook => {
  if (
    rawBody.byteLength > MAX_TIKTOK_WEBHOOK_BYTES ||
    clientSecret.length < 12 ||
    !Number.isSafeInteger(nowEpochMilliseconds) ||
    !Number.isSafeInteger(maximumAgeSeconds) ||
    maximumAgeSeconds < 0
  ) {
    throw new ProviderRuntimeError("tiktok", "rejected");
  }

  const fields = new Map<string, string>();
  for (const item of signatureHeader.split(",")) {
    const separator = item.indexOf("=");
    if (separator < 1) {
      throw new ProviderRuntimeError("tiktok", "rejected");
    }
    const name = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    if ((name === "t" || name === "s") && fields.has(name)) {
      throw new ProviderRuntimeError("tiktok", "rejected");
    }
    fields.set(name, value);
  }
  const timestampValue = fields.get("t");
  const signatureValue = fields.get("s");
  if (
    timestampValue === undefined ||
    !/^\d+$/.test(timestampValue) ||
    signatureValue === undefined ||
    !/^[a-f0-9]{64}$/i.test(signatureValue)
  ) {
    throw new ProviderRuntimeError("tiktok", "rejected");
  }

  const timestampEpochSeconds = Number(timestampValue);
  const nowEpochSeconds = Math.floor(nowEpochMilliseconds / 1_000);
  if (
    !Number.isSafeInteger(timestampEpochSeconds) ||
    Math.abs(nowEpochSeconds - timestampEpochSeconds) > maximumAgeSeconds
  ) {
    throw new ProviderRuntimeError("tiktok", "rejected");
  }

  const signedPayload = Buffer.concat([
    Buffer.from(`${timestampValue}.`, "utf8"),
    Buffer.from(rawBody),
  ]);
  const expected = createHmac("sha256", clientSecret)
    .update(signedPayload)
    .digest();
  const supplied = Buffer.from(signatureValue, "hex");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    throw new ProviderRuntimeError("tiktok", "rejected");
  }

  let body: unknown;
  try {
    body = JSON.parse(Buffer.from(rawBody).toString("utf8")) as unknown;
  } catch {
    throw new ProviderRuntimeError("tiktok", "invalid_response");
  }

  const dedupeKey = createHash("sha256")
    .update(Buffer.from(`${timestampValue}:${signatureValue}:`, "utf8"))
    .update(rawBody)
    .digest("base64url");

  return Object.freeze({ timestampEpochSeconds, dedupeKey, body });
};
