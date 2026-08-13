import { writeFile } from "node:fs/promises";
import type { StudioClipsAnalysisArtifact } from "../../contracts/StudioClipsAnalysisArtifact";
import { formatStudioClipsSrtTimestamp } from "./formatStudioClipsSrtTimestamp";
import type { StudioClipsRenderCandidate } from "./StudioClipsRenderCandidate";

export async function createStudioClipsSubtitleFile(input: {
  analysis: StudioClipsAnalysisArtifact;
  candidate: StudioClipsRenderCandidate;
  outputPath: string;
}): Promise<boolean> {
  const payload = input.analysis.payload;
  const excerpts =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as { transcriptExcerpts?: unknown }).transcriptExcerpts
      : undefined;
  if (!Array.isArray(excerpts)) return false;
  const cues = excerpts.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const excerpt = item as Record<string, unknown>;
    if (
      typeof excerpt.startSeconds !== "number" ||
      typeof excerpt.endSeconds !== "number" ||
      typeof excerpt.text !== "string" ||
      excerpt.endSeconds <= input.candidate.startSeconds ||
      excerpt.startSeconds >= input.candidate.endSeconds
    ) {
      return [];
    }
    const start = Math.max(0, excerpt.startSeconds - input.candidate.startSeconds);
    const end = Math.min(
      input.candidate.endSeconds - input.candidate.startSeconds,
      excerpt.endSeconds - input.candidate.startSeconds,
    );
    return end > start
      ? [{ end, start, text: excerpt.text.replace(/\r?\n/g, " ").trim() }]
      : [];
  });
  if (cues.length === 0) return false;
  const contents = cues
    .map(
      (cue, index) =>
        `${index + 1}\n${formatStudioClipsSrtTimestamp(cue.start)} --> ${formatStudioClipsSrtTimestamp(
          cue.end,
        )}\n${cue.text}\n`,
    )
    .join("\n");
  await writeFile(input.outputPath, contents, { encoding: "utf8", mode: 0o600 });
  return true;
}
