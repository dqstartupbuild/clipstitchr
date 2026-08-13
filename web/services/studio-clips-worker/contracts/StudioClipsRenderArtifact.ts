import type { StudioClipsCleanMasterArtifact } from "./StudioClipsCleanMasterArtifact";

export type StudioClipsRenderArtifact = {
  artifactId: string;
  contentType: string;
  fileName: string;
  localPath: string;
  sizeBytes: number;
  sourceOutputId?: string;
  cleanMaster?: StudioClipsCleanMasterArtifact;
};
