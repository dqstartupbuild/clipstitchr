import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";

export function assertStudioClipsOwnedObjectKey(
  ownerId: string,
  objectKey: string,
): void {
  const prefix = `users/${encodeURIComponent(ownerId)}/studio/v1/`;

  if (
    typeof objectKey !== "string" ||
    objectKey.length <= prefix.length ||
    objectKey.length > STUDIO_CLIPS_LIMITS.objectKeyCharacters ||
    !objectKey.startsWith(prefix) ||
    objectKey.includes("\\") ||
    objectKey.includes("..") ||
    objectKey.includes("?") ||
    objectKey.includes("#") ||
    /[\u0000-\u001f\u007f]/.test(objectKey)
  ) {
    throw new StudioClipsWorkerError({
      code: "SOURCE_OWNERSHIP_MISMATCH",
      kind: "permanent",
      publicMessage: "The source file does not belong to this Studio owner.",
    });
  }
}
