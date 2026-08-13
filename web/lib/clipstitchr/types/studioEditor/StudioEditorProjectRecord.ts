import type { StudioEditorProjectStatus } from "./StudioEditorProjectStatus";

export type StudioEditorProjectRecord = {
  id: string;
  productId: string;
  name: string;
  status: StudioEditorProjectStatus;
  revision: number;
  snapshotVersion: 1;
  snapshotJson: string;
  snapshotByteLength: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};
