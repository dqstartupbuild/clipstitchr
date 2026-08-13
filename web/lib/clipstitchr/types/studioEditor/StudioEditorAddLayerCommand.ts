import type { StudioEditorLayer } from "./StudioEditorLayer";

export type StudioEditorAddLayerCommand = {
  type: "addLayer";
  sceneId: string;
  trackId: string;
  index: number;
  layer: StudioEditorLayer;
};
