import type { StudioClipsRenderOperation } from "./StudioClipsRenderOperation";

export type StudioClipsRenderRevisionRequest = {
  idempotencyKey: string;
  operation: StudioClipsRenderOperation;
  productId: string;
  schemaVersion: "studio-clips-render-revision-request-v1";
  sourceOutputId: string;
  sourceOutputRevision: number;
  taskId: string;
};
