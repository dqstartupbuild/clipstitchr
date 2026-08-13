import type { StudioClipsJsonValue } from "../../contracts/StudioClipsJsonValue";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import { getStudioClipsExcerptOverlapsCandidates } from "./getStudioClipsExcerptOverlapsCandidates";
import { parseStudioClipsTranscriptExcerpts } from "./parseStudioClipsTranscriptExcerpts";
import { readStudioClipsAnalysisBrollOpportunity } from "./readStudioClipsAnalysisBrollOpportunity";
import { readStudioClipsAnalysisCandidate } from "./readStudioClipsAnalysisCandidate";
import type { StudioClipsAnalysisCandidatePayload } from "./StudioClipsAnalysisCandidatePayload";
import type { StudioClipsRawAnalysisCandidate } from "./StudioClipsRawAnalysisCandidate";
import type { StudioClipsTranscriptExcerpt } from "./StudioClipsTranscriptExcerpt";

export function readStudioClipsAnalysisPayload(input: {
  durationSeconds: number;
  raw: unknown;
  transcript: string;
}): StudioClipsJsonValue {
  if (!input.raw || typeof input.raw !== "object" || Array.isArray(input.raw)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_ANALYSIS_RESPONSE",
      kind: "permanent",
      publicMessage: "The clip analysis response could not be validated.",
    });
  }
  const raw = input.raw as Record<string, unknown>;
  if (
    !Array.isArray(raw.candidates) ||
    raw.candidates.length < 1 ||
    raw.candidates.length > 5
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_ANALYSIS_RESPONSE",
      kind: "permanent",
      publicMessage:
        "The clip analysis did not return a supported candidate set.",
    });
  }
  const candidates: StudioClipsAnalysisCandidatePayload[] = [];
  for (const [index, candidate] of (
    raw.candidates as StudioClipsRawAnalysisCandidate[]
  ).entries()) {
    candidates.push(
      readStudioClipsAnalysisCandidate({
        candidate,
        durationSeconds: input.durationSeconds,
        index,
      }),
    );
  }
  const allExcerpts = parseStudioClipsTranscriptExcerpts(input.transcript);
  const selectedExcerpts: StudioClipsTranscriptExcerpt[] = [];
  for (const excerpt of allExcerpts) {
    if (getStudioClipsExcerptOverlapsCandidates(excerpt, candidates)) {
      selectedExcerpts.push(excerpt);
      if (selectedExcerpts.length === 200) break;
    }
  }

  const brollOpportunities = [];
  if (Array.isArray(raw.brollOpportunities)) {
    for (const item of raw.brollOpportunities.slice(0, 5)) {
      const opportunity = readStudioClipsAnalysisBrollOpportunity(
        item,
        candidates,
      );
      if (opportunity) brollOpportunities.push(opportunity);
    }
  }

  return {
    brollOpportunities,
    candidates,
    schemaVersion: "studio-clips-analysis-v1",
    ...(typeof raw.summary === "string" && raw.summary.trim()
      ? { summary: raw.summary.trim().slice(0, 4_000) }
      : {}),
    transcriptExcerpts: selectedExcerpts,
  } as StudioClipsJsonValue;
}
