import type { StudioClipsMediaProbe } from "../../contracts/StudioClipsMediaProbe";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsCompletionEvidenceSnapshot } from "../../runtime/StudioClipsCompletionEvidence";
import { assertStudioClipsJsonValue } from "../../validation/assertStudioClipsJsonValue";
import { assertStudioClipsMediaProbe } from "../../validation/assertStudioClipsMediaProbe";
import { readStudioClipsStoredObjectProofs } from "./readStudioClipsStoredObjectProofs";

export function readStudioClipsCompletionEvidenceSnapshot(
  value: unknown,
): StudioClipsCompletionEvidenceSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CHECKPOINT_EVIDENCE",
      kind: "permanent",
      publicMessage: "The Studio Clips completion evidence is invalid.",
    });
  }
  const record = value as Record<string, unknown>;
  if (
    !record.renders ||
    typeof record.renders !== "object" ||
    Array.isArray(record.renders) ||
    !record.storage ||
    typeof record.storage !== "object" ||
    Array.isArray(record.storage)
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_CHECKPOINT_EVIDENCE",
      kind: "permanent",
      publicMessage: "The Studio Clips completion evidence is invalid.",
    });
  }
  if (record.analysis !== undefined) assertStudioClipsJsonValue(record.analysis);

  const renders: StudioClipsCompletionEvidenceSnapshot["renders"] = {};
  for (const [artifactId, item] of Object.entries(record.renders)) {
    if (
      !/^[A-Za-z0-9:_-]{1,160}$/.test(artifactId) ||
      !item ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      typeof (item as { fileName?: unknown }).fileName !== "string"
    ) {
      throw new StudioClipsWorkerError({
        code: "INVALID_CHECKPOINT_EVIDENCE",
        kind: "permanent",
        publicMessage: "The Studio Clips completion evidence is invalid.",
      });
    }
    const render = item as { fileName: string; media?: unknown };
    if (
      render.fileName.length > 200 ||
      render.fileName.includes("/") ||
      render.fileName.includes("\\")
    ) {
      throw new StudioClipsWorkerError({
        code: "INVALID_CHECKPOINT_EVIDENCE",
        kind: "permanent",
        publicMessage: "The Studio Clips completion evidence is invalid.",
      });
    }
    if (render.media !== undefined) {
      assertStudioClipsMediaProbe(render.media, { requireAudio: false });
    }
    renders[artifactId] = {
      fileName: render.fileName,
      ...(render.media
        ? { media: render.media as StudioClipsMediaProbe }
        : {}),
    };
  }

  return {
    ...(record.analysis !== undefined ? { analysis: record.analysis } : {}),
    renders,
    storage: readStudioClipsStoredObjectProofs(record.storage),
  };
}
