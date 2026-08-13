import type { StudioClipsAnalysisCandidatePayload } from "./StudioClipsAnalysisCandidatePayload";

export function readStudioClipsAnalysisBrollOpportunity(
  item: unknown,
  candidates: StudioClipsAnalysisCandidatePayload[],
):
  | {
      candidateId: string;
      durationSeconds: number;
      searchTerm: string;
      startSeconds: number;
    }
  | undefined {
  if (!item || typeof item !== "object" || Array.isArray(item)) return;
  const opportunity = item as Record<string, unknown>;
  if (
    !Number.isInteger(opportunity.candidateIndex) ||
    (opportunity.candidateIndex as number) < 0 ||
    (opportunity.candidateIndex as number) >= candidates.length ||
    typeof opportunity.durationSeconds !== "number" ||
    opportunity.durationSeconds < 2 ||
    opportunity.durationSeconds > 5 ||
    typeof opportunity.startSeconds !== "number" ||
    opportunity.startSeconds < 0 ||
    typeof opportunity.searchTerm !== "string" ||
    !opportunity.searchTerm.trim() ||
    opportunity.searchTerm.length > 120
  ) {
    return;
  }
  return {
    candidateId: candidates[opportunity.candidateIndex as number]!.id,
    durationSeconds: opportunity.durationSeconds,
    searchTerm: opportunity.searchTerm.trim(),
    startSeconds: opportunity.startSeconds,
  };
}
