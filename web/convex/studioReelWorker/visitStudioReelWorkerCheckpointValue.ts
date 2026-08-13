export function visitStudioReelWorkerCheckpointValue(
  candidate: unknown,
  depth: number,
): void {
  if (depth > 12) {
    throw new Error("Studio Stitch checkpoint is too deeply nested.");
  }
  if (
    candidate === null ||
    typeof candidate === "string" ||
    typeof candidate === "boolean"
  ) {
    return;
  }
  if (typeof candidate === "number") {
    if (!Number.isFinite(candidate)) {
      throw new Error("Studio Stitch checkpoint contains an invalid number.");
    }
    return;
  }
  if (Array.isArray(candidate)) {
    if (candidate.length > 2_000) {
      throw new Error("Studio Stitch checkpoint array is too large.");
    }
    for (const entry of candidate) {
      visitStudioReelWorkerCheckpointValue(entry, depth + 1);
    }
    return;
  }
  if (typeof candidate !== "object") {
    throw new Error("Studio Stitch checkpoint contains a non-JSON value.");
  }
  for (const [key, entry] of Object.entries(candidate)) {
    if (/secret|token|authorization|api.?key|signed.?url/i.test(key)) {
      throw new Error("Studio Stitch checkpoint contains a sensitive field.");
    }
    visitStudioReelWorkerCheckpointValue(entry, depth + 1);
  }
}
