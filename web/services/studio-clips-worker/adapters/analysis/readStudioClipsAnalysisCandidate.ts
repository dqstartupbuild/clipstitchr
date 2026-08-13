import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsAnalysisCandidatePayload } from "./StudioClipsAnalysisCandidatePayload";
import type { StudioClipsRawAnalysisCandidate } from "./StudioClipsRawAnalysisCandidate";
import { readStudioClipsAnalysisScore } from "./readStudioClipsAnalysisScore";

export function readStudioClipsAnalysisCandidate(input: {
  candidate: StudioClipsRawAnalysisCandidate;
  durationSeconds: number;
  index: number;
}): StudioClipsAnalysisCandidatePayload {
  const { candidate } = input;
  const startSeconds = candidate.startSeconds;
  const endSeconds = candidate.endSeconds;
  const minimumDuration = input.durationSeconds < 15 ? 0.25 : 15;
  const reasoning: string[] = [];
  if (Array.isArray(candidate.reasoning)) {
    for (const reason of candidate.reasoning) {
      if (
        typeof reason === "string" &&
        reason.trim() &&
        reason.length <= 1_000
      ) {
        reasoning.push(reason.trim());
      }
    }
  }
  if (
    typeof startSeconds !== "number" ||
    typeof endSeconds !== "number" ||
    !Number.isFinite(startSeconds) ||
    !Number.isFinite(endSeconds) ||
    startSeconds < 0 ||
    endSeconds <= startSeconds ||
    endSeconds > input.durationSeconds + 0.05 ||
    endSeconds - startSeconds < minimumDuration ||
    endSeconds - startSeconds > 60 ||
    !Array.isArray(candidate.reasoning) ||
    candidate.reasoning.length < 1 ||
    candidate.reasoning.length > 5 ||
    reasoning.length !== candidate.reasoning.length ||
    typeof candidate.title !== "string" ||
    !candidate.title.trim() ||
    candidate.title.length > 200
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_ANALYSIS_CANDIDATE",
      kind: "permanent",
      publicMessage: "A selected clip range could not be validated.",
    });
  }
  return {
    endSeconds,
    id: `candidate-${input.index + 1}`,
    reasoning,
    score: readStudioClipsAnalysisScore(candidate.score),
    startSeconds,
    title: candidate.title.trim(),
  };
}
