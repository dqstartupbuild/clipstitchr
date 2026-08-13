import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsCheckpointFileReference } from "./studioClipsCheckpointFormat";

export function readStudioClipsCheckpointDocument(value: Uint8Array) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(value));
  } catch {
    parsed = null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CHECKPOINT_DOCUMENT",
      kind: "permanent",
      publicMessage: "The Studio Clips resume snapshot is invalid.",
    });
  }
  const document = parsed as Record<string, unknown>;
  if (
    document.schemaVersion !== "studio-clips-checkpoint-document-v1" ||
    !Array.isArray(document.files) ||
    !document.state ||
    typeof document.state !== "object" ||
    Array.isArray(document.state)
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CHECKPOINT_DOCUMENT",
      kind: "permanent",
      publicMessage: "The Studio Clips resume snapshot is invalid.",
    });
  }
  return document as {
    evidence: unknown;
    files: StudioClipsCheckpointFileReference[];
    schemaVersion: "studio-clips-checkpoint-document-v1";
    state: Record<string, unknown>;
  };
}
