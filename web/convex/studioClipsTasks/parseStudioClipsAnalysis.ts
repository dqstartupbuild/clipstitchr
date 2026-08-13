import type { StudioClipsAnalysis } from "../../lib/clipstitchr/types/studioClips/StudioClipsAnalysis";
import { normalizeStudioClipsAnalysis } from "../studioClipsWorker/normalizeStudioClipsAnalysis";

export function parseStudioClipsAnalysis(
  snapshotVersion: number,
  snapshotJson: string,
): StudioClipsAnalysis {
  if (snapshotVersion !== 1) {
    throw new Error("Stored Studio Clips analysis uses an unsupported version.");
  }
  return normalizeStudioClipsAnalysis(
    JSON.parse(snapshotJson) as StudioClipsAnalysis,
  );
}
