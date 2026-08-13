import type { StudioEditorProjectStatus } from "./StudioEditorProjectStatus";

export type StudioEditorProjectRevisionRecord = {
  createdAt: string;
  name: string;
  operation: "archive" | "autosave" | "create" | "reopen";
  productId: string;
  projectId: string;
  revision: number;
  snapshotByteLength: number;
  snapshotJson: string;
  snapshotVersion: 1;
  status: StudioEditorProjectStatus;
};
