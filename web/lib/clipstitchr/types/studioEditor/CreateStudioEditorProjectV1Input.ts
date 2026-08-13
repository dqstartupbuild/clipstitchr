import type { StudioEditorCanvasV1 } from "./StudioEditorCanvasV1";

export type CreateStudioEditorProjectV1Input = {
  id: string;
  productId: string;
  name: string;
  sceneId: string;
  visualTrackId: string;
  audioTrackId: string;
  captionTrackId: string;
  canvas?: StudioEditorCanvasV1;
};
