import type { StudioEditorLayer } from "./StudioEditorLayer";

export type StudioEditorUpdateLayerCommand = {
  type: "updateLayer";
  sceneId: string;
  trackId: string;
  layer: StudioEditorLayer;
};
