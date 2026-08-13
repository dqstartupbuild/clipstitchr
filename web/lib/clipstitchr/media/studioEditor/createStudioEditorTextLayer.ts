import { createDefaultStudioEditorTextStyle } from "@/lib/clipstitchr/studio/editor/createDefaultStudioEditorTextStyle";
import { createDefaultStudioEditorTransform } from "@/lib/clipstitchr/studio/editor/createDefaultStudioEditorTransform";
import { createDefaultStudioEditorTransition } from "@/lib/clipstitchr/studio/editor/createDefaultStudioEditorTransition";
import type { StudioEditorTextLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorTextLayer";
import { createId } from "@/lib/clipstitchr/utils/createId";

type CreateStudioEditorTextLayerOptions = {
  durationSeconds: number;
  startSeconds: number;
};

export function createStudioEditorTextLayer({
  durationSeconds,
  startSeconds,
}: CreateStudioEditorTextLayerOptions): StudioEditorTextLayer {
  return {
    id: createId(),
    kind: "text",
    name: "Text",
    startSeconds,
    durationSeconds,
    sourceOffsetSeconds: 0,
    text: "Say it clearly",
    style: createDefaultStudioEditorTextStyle(),
    transform: createDefaultStudioEditorTransform(),
    transitionIn: createDefaultStudioEditorTransition(),
  };
}
