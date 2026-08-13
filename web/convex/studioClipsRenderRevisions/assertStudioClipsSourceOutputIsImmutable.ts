import type { Doc } from "../_generated/dataModel";

export function assertStudioClipsSourceOutputIsImmutable(
  output: Doc<"studioClipsOutputs">,
  expectedRevision: number,
) {
  if (
    output.revision !== expectedRevision ||
    !output.fileName ||
    output.durationSeconds === undefined ||
    output.hasAudio === undefined ||
    output.height === undefined ||
    !output.videoCodec ||
    output.width === undefined
  ) {
    throw new Error(
      output.revision !== expectedRevision
        ? `Studio Clips output revision conflict: expected ${expectedRevision}, current ${output.revision}.`
        : "This older Studio Clips output does not have the media facts required for a render revision.",
    );
  }
  return output;
}
