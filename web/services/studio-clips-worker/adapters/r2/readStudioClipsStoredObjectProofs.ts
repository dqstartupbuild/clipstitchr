import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsCompletionEvidenceSnapshot } from "../../runtime/StudioClipsCompletionEvidence";

export function readStudioClipsStoredObjectProofs(
  value: unknown,
): StudioClipsCompletionEvidenceSnapshot["storage"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CHECKPOINT_EVIDENCE",
      kind: "permanent",
      publicMessage: "The Studio Clips completion evidence is invalid.",
    });
  }
  const result: StudioClipsCompletionEvidenceSnapshot["storage"] = {};
  for (const [artifactId, candidate] of Object.entries(value)) {
    if (
      !/^[A-Za-z0-9:_-]{1,160}$/.test(artifactId) ||
      !candidate ||
      typeof candidate !== "object" ||
      Array.isArray(candidate)
    ) {
      throw new StudioClipsWorkerError({
        code: "INVALID_CHECKPOINT_EVIDENCE",
        kind: "permanent",
        publicMessage: "The Studio Clips completion evidence is invalid.",
      });
    }
    const proof = candidate as Record<string, unknown>;
    const keys = Object.keys(proof);
    if (
      keys.some((key) => !["etag", "key", "versionId"].includes(key)) ||
      typeof proof.etag !== "string" ||
      !/^[A-Za-z0-9+/=_-]{8,128}$/.test(proof.etag) ||
      typeof proof.key !== "string" ||
      !proof.key.startsWith("users/") ||
      proof.key.length > 1_024 ||
      proof.key.includes("..") ||
      proof.key.includes("\\") ||
      (proof.versionId !== undefined &&
        (typeof proof.versionId !== "string" ||
          proof.versionId.length < 1 ||
          proof.versionId.length > 1_024 ||
          /[\u0000-\u001f\u007f]/.test(proof.versionId)))
    ) {
      throw new StudioClipsWorkerError({
        code: "INVALID_CHECKPOINT_EVIDENCE",
        kind: "permanent",
        publicMessage: "The Studio Clips completion evidence is invalid.",
      });
    }
    result[artifactId] = {
      etag: proof.etag,
      key: proof.key,
      ...(typeof proof.versionId === "string"
        ? { versionId: proof.versionId }
        : {}),
    };
  }
  return result;
}
