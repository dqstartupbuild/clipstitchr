import type { StudioEditorProjectStatus } from "./StudioEditorProjectStatus";

export type StudioEditorProjectSummary = {
  id: string;
  productId: string;
  name: string;
  status: StudioEditorProjectStatus;
  revision: number;
  snapshotVersion: 1;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};
