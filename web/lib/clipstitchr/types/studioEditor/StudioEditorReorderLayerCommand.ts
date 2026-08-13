export type StudioEditorReorderLayerCommand = {
  type: "reorderLayer";
  sceneId: string;
  fromTrackId: string;
  toTrackId: string;
  layerId: string;
  toIndex: number;
};
