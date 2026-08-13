import type { StudioClipsAnalysis } from "../../lib/clipstitchr/types/studioClips/StudioClipsAnalysis";
import type { StudioClipsCaptionCue } from "../../lib/clipstitchr/types/studioClips/StudioClipsCaptionCue";

export function createStudioClipsOutputCaptionCues(
  analysis: StudioClipsAnalysis | undefined,
  artifactId: string,
): StudioClipsCaptionCue[] {
  const candidate = analysis?.candidates.find((item) => item.id === artifactId);
  if (!candidate) return [];
  return analysis!.transcriptExcerpts.flatMap((excerpt) => {
    if (
      excerpt.endSeconds <= candidate.startSeconds ||
      excerpt.startSeconds >= candidate.endSeconds
    ) {
      return [];
    }
    const startSeconds = Math.max(0, excerpt.startSeconds - candidate.startSeconds);
    const endSeconds = Math.min(
      candidate.endSeconds - candidate.startSeconds,
      excerpt.endSeconds - candidate.startSeconds,
    );
    return endSeconds > startSeconds
      ? [{ endSeconds, startSeconds, text: excerpt.text }]
      : [];
  });
}
