import type { StudioClipsTranscriptExcerpt } from "./StudioClipsTranscriptExcerpt";
import { readStudioClipsTranscriptTimestamp } from "./readStudioClipsTranscriptTimestamp";

const linePattern =
  /^\[(\d{1,2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)\s+-\s+(\d{1,2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)\]\s+(.+)$/;

export function parseStudioClipsTranscriptExcerpts(
  transcript: string,
): StudioClipsTranscriptExcerpt[] {
  const excerpts: StudioClipsTranscriptExcerpt[] = [];
  for (const line of transcript.split(/\r?\n/)) {
    const match = line.trim().match(linePattern);
    if (!match) continue;
    const startSeconds = readStudioClipsTranscriptTimestamp(match[1]);
    const endSeconds = readStudioClipsTranscriptTimestamp(match[2]);
    const text = match[3].trim().slice(0, 2_000);
    if (
      startSeconds === undefined ||
      endSeconds === undefined ||
      endSeconds <= startSeconds ||
      !text
    ) {
      continue;
    }
    excerpts.push({ endSeconds, startSeconds, text });
  }
  return excerpts;
}
