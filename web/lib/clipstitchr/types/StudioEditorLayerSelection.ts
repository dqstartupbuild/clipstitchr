import type { StudioEditorLayer } from "./studioEditor/StudioEditorLayer";
import type { StudioEditorTrackV1 } from "./studioEditor/StudioEditorTrackV1";

export type StudioEditorLayerSelection = {
  index: number;
  layer: StudioEditorLayer;
  track: StudioEditorTrackV1;
};
