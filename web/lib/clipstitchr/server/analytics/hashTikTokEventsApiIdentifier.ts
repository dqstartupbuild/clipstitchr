import { createHash } from "node:crypto";

export function hashTikTokEventsApiIdentifier(value: string | undefined) {
  const normalizedValue = value?.trim().toLowerCase();

  if (!normalizedValue) {
    return undefined;
  }

  return createHash("sha256").update(normalizedValue).digest("hex");
}
