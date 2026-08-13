import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export function normalizeStudioReelObjectVersion(input: {
  etag: unknown;
  versionId: unknown;
}) {
  const versionId = typeof input.versionId === "string" ? input.versionId : "";
  const etag = typeof input.etag === "string"
    ? input.etag.replace(/^"|"$/g, "")
    : "";
  const value = versionId || etag;
  if (
    value.length < 8 ||
    value.length > 256 ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    throw new StudioReelWorkerError({
      code: "R2_OBJECT_IDENTITY_MISSING",
      kind: "retryable",
      publicMessage: "R2 did not return a durable Studio Stitch object identity.",
    });
  }
  return value;
}
