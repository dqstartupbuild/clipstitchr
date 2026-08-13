import { normalizeStudioClipsSafeJsonValue } from "./normalizeStudioClipsSafeJsonValue";

export function normalizeStudioClipsSafeJsonSnapshot(
  snapshotJson: string,
  maxBytes: number,
) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(snapshotJson);
  } catch {
    throw new Error("The Studio Clips JSON snapshot is invalid.");
  }
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error("The Studio Clips JSON snapshot must be an object.");
  }
  const value = normalizeStudioClipsSafeJsonValue(parsed, { nodes: 0 }, 0);
  const json = JSON.stringify(value);
  const byteLength = new TextEncoder().encode(json).byteLength;
  if (byteLength > maxBytes) {
    throw new Error("The Studio Clips JSON snapshot is too large.");
  }
  return { byteLength, json, value };
}
