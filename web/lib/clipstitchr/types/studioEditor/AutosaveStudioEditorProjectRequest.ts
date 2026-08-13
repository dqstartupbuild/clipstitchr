export type AutosaveStudioEditorProjectRequest = {
  id: string;
  productId: string;
  expectedRevision: number;
  idempotencyKey: string;
  snapshotJson: string;
};
