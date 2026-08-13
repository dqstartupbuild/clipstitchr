import type { StudioReelGeminiAnalysis } from "../../contracts/StudioReelGeminiAnalysis";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export function readStudioReelGeminiAnalysis(value: unknown): StudioReelGeminiAnalysis {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new StudioReelWorkerError({
      code: "GEMINI_ANALYSIS_INVALID",
      kind: "permanent",
      publicMessage: "Gemini returned invalid grounded demo analysis.",
    });
  }
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.summary !== "string" ||
    candidate.summary.trim().length < 1 ||
    candidate.summary.length > 1_000 ||
    !Array.isArray(candidate.selectedMoments) ||
    candidate.selectedMoments.length > 20
  ) {
    throw new StudioReelWorkerError({
      code: "GEMINI_ANALYSIS_INVALID",
      kind: "permanent",
      publicMessage: "Gemini returned invalid grounded demo analysis.",
    });
  }
  const selectedMoments = candidate.selectedMoments.map((moment) => {
    if (!moment || Array.isArray(moment) || typeof moment !== "object") {
      throw new StudioReelWorkerError({
        code: "GEMINI_ANALYSIS_INVALID",
        kind: "permanent",
        publicMessage: "Gemini returned an invalid demo moment.",
      });
    }
    const entry = moment as Record<string, unknown>;
    if (
      typeof entry.startSeconds !== "number" ||
      typeof entry.endSeconds !== "number" ||
      !Number.isFinite(entry.startSeconds) ||
      !Number.isFinite(entry.endSeconds) ||
      entry.startSeconds < 0 ||
      entry.endSeconds <= entry.startSeconds ||
      typeof entry.reason !== "string" ||
      entry.reason.trim().length < 1 ||
      entry.reason.length > 500
    ) {
      throw new StudioReelWorkerError({
        code: "GEMINI_ANALYSIS_INVALID",
        kind: "permanent",
        publicMessage: "Gemini returned an invalid demo moment.",
      });
    }
    return {
      endSeconds: entry.endSeconds,
      reason: entry.reason,
      startSeconds: entry.startSeconds,
    };
  });
  return { selectedMoments, summary: candidate.summary };
}
