import type { StudioEditorAudioSettings } from "./StudioEditorAudioSettings";
import type { StudioEditorCrop } from "./StudioEditorCrop";
import type { StudioEditorLayerBase } from "./StudioEditorLayerBase";
import type { StudioEditorSourceRef } from "./StudioEditorSourceRef";
import type { StudioEditorTransform } from "./StudioEditorTransform";
import type { StudioEditorTransition } from "./StudioEditorTransition";

export type StudioEditorVideoLayer = StudioEditorLayerBase<"video"> & {
  source: StudioEditorSourceRef;
  sourceDurationSeconds: number;
  playbackSpeed: number;
  transform: StudioEditorTransform;
  crop: StudioEditorCrop;
  audio: StudioEditorAudioSettings;
  transitionIn: StudioEditorTransition;
};
