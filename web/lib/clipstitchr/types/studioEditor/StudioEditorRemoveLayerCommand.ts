export type StudioEditorRemoveLayerCommand = {
  type: "removeLayer";
  sceneId: string;
  trackId: string;
  layerId: string;
};
