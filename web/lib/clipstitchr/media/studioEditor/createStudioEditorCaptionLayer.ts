import { createDefaultStudioEditorCaptionStyle } from "@/lib/clipstitchr/studio/editor/createDefaultStudioEditorCaptionStyle";
import type { StudioEditorCaptionLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCaptionLayer";
import { createId } from "@/lib/clipstitchr/utils/createId";

type CreateStudioEditorCaptionLayerOptions = {
  durationSeconds: number;
  startSeconds: number;
};

export function createStudioEditorCaptionLayer({
  durationSeconds,
  startSeconds,
}: CreateStudioEditorCaptionLayerOptions): StudioEditorCaptionLayer {
  return {
    id: createId(),
    kind: "caption",
    name: "Captions",
    startSeconds,
    durationSeconds,
    sourceOffsetSeconds: 0,
    cues: [
      {
        id: createId(),
        startSeconds: 0,
        endSeconds: durationSeconds,
        text: "Add your caption",
      },
    ],
    style: createDefaultStudioEditorCaptionStyle(),
  };
}
