import type { Doc } from "../_generated/dataModel";
import type { StudioStitchMaterializationProof } from "../../lib/clipstitchr/types/studioStitch/StudioStitchMaterializationProof";

export function assertStudioReelMaterializationProof(
  output: Doc<"studioReelOutputs">,
  proof: StudioStitchMaterializationProof,
) {
  const matches =
    output.objectKey === proof.objectKey &&
    output.objectVersion === proof.objectVersion &&
    output.sha256 === proof.sha256 &&
    output.contentType === proof.contentType &&
    output.byteLength === proof.byteLength &&
    output.durationSeconds === proof.durationSeconds &&
    output.width === proof.width &&
    output.height === proof.height &&
    output.hasAudio === proof.hasAudio &&
    output.videoCodec === proof.videoCodec &&
    output.audioCodec === proof.audioCodec;

  if (!matches) {
    throw new Error(
      "The durable Studio Stitch object no longer matches its verified output record.",
    );
  }
}
