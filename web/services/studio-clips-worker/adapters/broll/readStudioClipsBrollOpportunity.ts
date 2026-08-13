import type { StudioClipsBrollOpportunity } from "./StudioClipsBrollOpportunity";

export function readStudioClipsBrollOpportunity(
  item: unknown,
  seen: Set<string>,
): StudioClipsBrollOpportunity | undefined {
  if (!item || typeof item !== "object" || Array.isArray(item)) return;
  const value = item as Record<string, unknown>;
  if (
    typeof value.candidateId !== "string" ||
    !/^candidate-[1-5]$/.test(value.candidateId) ||
    seen.has(value.candidateId) ||
    typeof value.durationSeconds !== "number" ||
    value.durationSeconds < 2 ||
    value.durationSeconds > 5 ||
    typeof value.searchTerm !== "string" ||
    !value.searchTerm.trim() ||
    value.searchTerm.length > 120 ||
    typeof value.startSeconds !== "number" ||
    value.startSeconds < 0
  ) {
    return;
  }
  seen.add(value.candidateId);
  return value as StudioClipsBrollOpportunity;
}
