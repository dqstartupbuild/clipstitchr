import type { StudioEditorCaptionStyle } from "../../types/studioEditor/StudioEditorCaptionStyle";
import { createDefaultStudioEditorTextStyle } from "./createDefaultStudioEditorTextStyle";

export function createDefaultStudioEditorCaptionStyle(): StudioEditorCaptionStyle {
  return {
    text: createDefaultStudioEditorTextStyle(),
    activeColor: "#FFD400",
    maxWidthRatio: 0.86,
    positionYRatio: 0.78,
    wordsPerPage: 5,
  };
}
