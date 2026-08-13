import { visitStudioReelWorkerCheckpointValue } from "./visitStudioReelWorkerCheckpointValue";

const MAX_CHECKPOINT_BYTES = 128 * 1024;

export function normalizeStudioReelWorkerCheckpointSnapshot(snapshotJson: string) {
  if (
    typeof snapshotJson !== "string" ||
    new TextEncoder().encode(snapshotJson).byteLength > MAX_CHECKPOINT_BYTES
  ) {
    throw new Error("Studio Stitch checkpoint exceeds the 128 KiB limit.");
  }
  let value: unknown;
  try {
    value = JSON.parse(snapshotJson) as unknown;
  } catch {
    throw new Error("Studio Stitch checkpoint must be valid JSON.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Studio Stitch checkpoint must be a JSON object.");
  }
  visitStudioReelWorkerCheckpointValue(value, 0);
  const json = JSON.stringify(value);
  const byteLength = new TextEncoder().encode(json).byteLength;
  if (byteLength > MAX_CHECKPOINT_BYTES) {
    throw new Error("Studio Stitch checkpoint exceeds the 128 KiB limit.");
  }
  return { byteLength, json };
}
