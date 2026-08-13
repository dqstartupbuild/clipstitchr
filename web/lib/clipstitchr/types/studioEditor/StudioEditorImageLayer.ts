import type { StudioEditorCrop } from "./StudioEditorCrop";
import type { StudioEditorLayerBase } from "./StudioEditorLayerBase";
import type { StudioEditorSourceRef } from "./StudioEditorSourceRef";
import type { StudioEditorTransform } from "./StudioEditorTransform";
import type { StudioEditorTransition } from "./StudioEditorTransition";

export type StudioEditorImageLayer = StudioEditorLayerBase<"image"> & {
  source: StudioEditorSourceRef;
  transform: StudioEditorTransform;
  crop: StudioEditorCrop;
  transitionIn: StudioEditorTransition;
};
