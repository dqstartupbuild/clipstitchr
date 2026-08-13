import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import { STUDIO_CLIPS_MAXIMUM_CHECKPOINT_BYTES } from "./studioClipsCheckpointFormat";

export function readStudioClipsCheckpointPointer(value: string, prefix: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    parsed = null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CHECKPOINT_POINTER",
      kind: "permanent",
      publicMessage: "The Studio Clips resume pointer is invalid.",
    });
  }
  const pointer = parsed as Record<string, unknown>;
  if (
    pointer.schemaVersion !== "studio-clips-r2-checkpoint-v1" ||
    typeof pointer.key !== "string" ||
    !pointer.key.startsWith(`${prefix}/`) ||
    typeof pointer.sha256Hex !== "string" ||
    !/^[a-f0-9]{64}$/.test(pointer.sha256Hex) ||
    !Number.isInteger(pointer.sizeBytes) ||
    (pointer.sizeBytes as number) < 1 ||
    (pointer.sizeBytes as number) > STUDIO_CLIPS_MAXIMUM_CHECKPOINT_BYTES
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CHECKPOINT_POINTER",
      kind: "permanent",
      publicMessage: "The Studio Clips resume pointer is invalid.",
    });
  }
  return pointer as {
    key: string;
    schemaVersion: "studio-clips-r2-checkpoint-v1";
    sha256Hex: string;
    sizeBytes: number;
  };
}
