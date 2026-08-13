import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";

export function assertStudioClipsProductUploadObjectKey(input: {
  kind: "font" | "media-source";
  objectKey: string;
  ownerId: string;
  productId: string;
}): void {
  const prefix = [
    `users/${encodeURIComponent(input.ownerId)}/studio/v1`,
    input.kind,
    input.productId,
    "",
  ].join("/");
  if (
    input.objectKey.length <= prefix.length ||
    input.objectKey.length > STUDIO_CLIPS_LIMITS.objectKeyCharacters ||
    !input.objectKey.startsWith(prefix) ||
    input.objectKey.includes("\\") ||
    input.objectKey.includes("..") ||
    input.objectKey.includes("?") ||
    input.objectKey.includes("#") ||
    /[\u0000-\u001f\u007f]/u.test(input.objectKey)
  ) {
    throw new StudioClipsWorkerError({
      code:
        input.kind === "font"
          ? "CUSTOM_FONT_OWNERSHIP_MISMATCH"
          : "SOURCE_OWNERSHIP_MISMATCH",
      kind: "permanent",
      publicMessage:
        input.kind === "font"
          ? "The custom caption font does not belong to this Product."
          : "The source file does not belong to this Product.",
    });
  }
}
