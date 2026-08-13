import type { StudioStitchMaterializeResult } from "../../lib/clipstitchr/types/studioStitch/StudioStitchMaterializeResult";

export function toStudioReelMaterializeResult(input: {
  readonly created: boolean;
  readonly libraryClipId: string;
  readonly outputId: string;
}): StudioStitchMaterializeResult {
  return {
    created: input.created,
    outputId: input.outputId,
    libraryAsset: { kind: "videoClip", id: input.libraryClipId },
    editorSource: { kind: "studioOutput", outputId: input.outputId },
    publishingSource: {
      kind: "studio-stitch-output",
      sourceId: input.outputId,
    },
  };
}
