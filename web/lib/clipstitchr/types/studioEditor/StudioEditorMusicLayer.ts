import type { StudioEditorAudioSettings } from "./StudioEditorAudioSettings";
import type { StudioEditorLayerBase } from "./StudioEditorLayerBase";
import type { StudioEditorSourceRef } from "./StudioEditorSourceRef";

export type StudioEditorMusicLayer = StudioEditorLayerBase<"music"> & {
  source: StudioEditorSourceRef;
  sourceDurationSeconds: number;
  playbackSpeed: number;
  audio: StudioEditorAudioSettings;
};
