import type { StudioEditorLayerBase } from "./StudioEditorLayerBase";
import type { StudioEditorTextStyle } from "./StudioEditorTextStyle";
import type { StudioEditorTransform } from "./StudioEditorTransform";
import type { StudioEditorTransition } from "./StudioEditorTransition";

export type StudioEditorTextLayer = StudioEditorLayerBase<"text"> & {
  text: string;
  style: StudioEditorTextStyle;
  transform: StudioEditorTransform;
  transitionIn: StudioEditorTransition;
};
