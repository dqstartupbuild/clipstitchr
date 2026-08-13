import type { StudioClipsOutputEditOperation } from "./StudioClipsOutputEditOperation";

export type StudioClipsOutputUpdateRequest = {
  edit: StudioClipsOutputEditOperation;
  expectedRevision: number;
  idempotencyKey: string;
  productId: string;
  taskId: string;
};
