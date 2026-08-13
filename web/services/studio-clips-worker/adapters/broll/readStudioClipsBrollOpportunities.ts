import type { StudioClipsAnalysisArtifact } from "../../contracts/StudioClipsAnalysisArtifact";
import type { StudioClipsBrollOpportunity } from "./StudioClipsBrollOpportunity";
import { readStudioClipsBrollOpportunity } from "./readStudioClipsBrollOpportunity";

export function readStudioClipsBrollOpportunities(
  analysis: StudioClipsAnalysisArtifact,
): StudioClipsBrollOpportunity[] {
  const payload = analysis.payload;
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    return [];
  const items = (payload as { brollOpportunities?: unknown })
    .brollOpportunities;
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const opportunities: StudioClipsBrollOpportunity[] = [];
  for (const item of items.slice(0, 5)) {
    const opportunity = readStudioClipsBrollOpportunity(item, seen);
    if (opportunity) opportunities.push(opportunity);
  }
  return opportunities;
}
