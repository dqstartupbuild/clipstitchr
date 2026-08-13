import type { StudioEditorProjectStatus } from "./StudioEditorProjectStatus";

export type StudioEditorProjectWriteResult = {
  created: boolean;
  projectId: string;
  revision: number;
  status: StudioEditorProjectStatus;
};
