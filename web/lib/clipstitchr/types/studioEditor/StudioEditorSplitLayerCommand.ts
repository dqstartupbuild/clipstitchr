export type StudioEditorSplitLayerCommand = {
  type: "splitLayer";
  sceneId: string;
  trackId: string;
  layerId: string;
  splitSeconds: number;
  rightLayerId: string;
};
