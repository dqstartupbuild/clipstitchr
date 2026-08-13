export type StudioEditorTrimLayerCommand = {
  type: "trimLayer";
  sceneId: string;
  trackId: string;
  layerId: string;
  startSeconds: number;
  durationSeconds: number;
  sourceOffsetSeconds: number;
};
