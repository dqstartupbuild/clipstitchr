import type { StudioEditorCaptionCue } from "./StudioEditorCaptionCue";
import type { StudioEditorCaptionStyle } from "./StudioEditorCaptionStyle";
import type { StudioEditorLayerBase } from "./StudioEditorLayerBase";

export type StudioEditorCaptionLayer = StudioEditorLayerBase<"caption"> & {
  cues: StudioEditorCaptionCue[];
  style: StudioEditorCaptionStyle;
};
