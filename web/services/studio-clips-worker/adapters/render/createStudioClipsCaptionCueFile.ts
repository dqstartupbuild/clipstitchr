import { writeFile } from "node:fs/promises";
import type { StudioClipsCaptionCue } from "../../../../lib/clipstitchr/types/studioClips/StudioClipsCaptionCue";
import { formatStudioClipsSrtTimestamp } from "./formatStudioClipsSrtTimestamp";

export async function createStudioClipsCaptionCueFile(input: {
  cues: StudioClipsCaptionCue[];
  outputPath: string;
}): Promise<void> {
  const contents = input.cues
    .map(
      (cue, index) =>
        `${index + 1}\n${formatStudioClipsSrtTimestamp(cue.startSeconds)} --> ${formatStudioClipsSrtTimestamp(
          cue.endSeconds,
        )}\n${cue.text.replace(/\r?\n/gu, " ").trim()}\n`,
    )
    .join("\n");
  await writeFile(input.outputPath, contents, { encoding: "utf8", mode: 0o600 });
}
