import type { StudioClipsAnalysisArtifact } from "../../contracts/StudioClipsAnalysisArtifact";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsRenderCandidate } from "./StudioClipsRenderCandidate";

export function readStudioClipsRenderCandidates(
  analysis: StudioClipsAnalysisArtifact,
  durationSeconds: number,
): StudioClipsRenderCandidate[] {
  const payload = analysis.payload;
  const candidates =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as { candidates?: unknown }).candidates
      : undefined;
  if (!Array.isArray(candidates) || candidates.length < 1 || candidates.length > 10) {
    throw new StudioClipsWorkerError({
      code: "INVALID_RENDER_PLAN",
      kind: "permanent",
      publicMessage: "The clip render plan could not be validated.",
    });
  }
  return candidates.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new StudioClipsWorkerError({
        code: "INVALID_RENDER_PLAN",
        kind: "permanent",
        publicMessage: "The clip render plan could not be validated.",
      });
    }
    const value = item as Record<string, unknown>;
    if (
      typeof value.id !== "string" ||
      !/^[A-Za-z0-9:_-]{1,160}$/.test(value.id) ||
      typeof value.startSeconds !== "number" ||
      typeof value.endSeconds !== "number" ||
      value.startSeconds < 0 ||
      value.endSeconds <= value.startSeconds ||
      value.endSeconds > durationSeconds + 0.05 ||
      (value.title !== undefined && typeof value.title !== "string")
    ) {
      throw new StudioClipsWorkerError({
        code: "INVALID_RENDER_PLAN",
        kind: "permanent",
        publicMessage: "A clip render range could not be validated.",
      });
    }
    return {
      endSeconds: value.endSeconds,
      id: value.id,
      startSeconds: value.startSeconds,
      ...(typeof value.title === "string" ? { title: value.title } : {}),
    };
  });
}
