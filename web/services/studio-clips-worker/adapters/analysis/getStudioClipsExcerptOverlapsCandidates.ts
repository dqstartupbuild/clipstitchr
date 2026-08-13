import type { StudioClipsAnalysisCandidatePayload } from "./StudioClipsAnalysisCandidatePayload";
import type { StudioClipsTranscriptExcerpt } from "./StudioClipsTranscriptExcerpt";

export function getStudioClipsExcerptOverlapsCandidates(
  excerpt: StudioClipsTranscriptExcerpt,
  candidates: StudioClipsAnalysisCandidatePayload[],
): boolean {
  for (const candidate of candidates) {
    if (
      excerpt.endSeconds > candidate.startSeconds &&
      excerpt.startSeconds < candidate.endSeconds
    ) {
      return true;
    }
  }
  return false;
}
