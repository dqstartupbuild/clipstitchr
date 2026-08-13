export type CreateStudioEditorProjectRequest = {
  id: string;
  productId: string;
  name: string;
  idempotencyKey: string;
  snapshotJson: string;
};
