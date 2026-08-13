export type ChangeStudioEditorProjectStatusRequest = {
  id: string;
  productId: string;
  expectedRevision: number;
  idempotencyKey: string;
};
