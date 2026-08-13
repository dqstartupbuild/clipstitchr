import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";

export function assertStudioClipsR2ObjectKey(key: string): void {
  if (
    !key.startsWith("users/") ||
    key.length > 1_024 ||
    key.includes("..") ||
    key.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(key)
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_R2_OBJECT_KEY",
      kind: "permanent",
      publicMessage: "The Studio Clips storage key is invalid.",
    });
  }
}
