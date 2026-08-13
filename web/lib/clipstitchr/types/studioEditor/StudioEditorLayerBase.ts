import type { StudioEditorLayerKind } from "./StudioEditorLayerKind";

export type StudioEditorLayerBase<Kind extends StudioEditorLayerKind> = {
  id: string;
  kind: Kind;
  name: string;
  startSeconds: number;
  durationSeconds: number;
  sourceOffsetSeconds: number;
};
