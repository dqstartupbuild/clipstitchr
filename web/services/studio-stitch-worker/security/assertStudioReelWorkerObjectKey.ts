import { StudioReelWorkerError } from "../errors/StudioReelWorkerError";
import { getStudioReelOwnerPrefix } from "./getStudioReelOwnerPrefix";

export function assertStudioReelWorkerObjectKey(
  ownerId: string,
  objectKey: string,
) {
  if (
    !objectKey.startsWith(getStudioReelOwnerPrefix(ownerId)) ||
    objectKey.length > 1_024 ||
    objectKey.includes("..") ||
    objectKey.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(objectKey)
  ) {
    throw new StudioReelWorkerError({
      code: "INVALID_R2_OBJECT_KEY",
      kind: "permanent",
      publicMessage: "A Studio Stitch storage key is outside its owner namespace.",
    });
  }
  return objectKey;
}
