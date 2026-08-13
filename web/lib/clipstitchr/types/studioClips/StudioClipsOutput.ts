import type { StudioClipsOutputEditState } from "./StudioClipsOutputEditState";
import type { StudioClipsPlatformPreset } from "./StudioClipsPlatformPreset";

export type StudioClipsOutput = {
  artifactId: string;
  audioCodec?: string;
  contentType: string;
  createdAt: string;
  durationSeconds?: number;
  edit: StudioClipsOutputEditState;
  id: string;
  fileName?: string;
  hasAudio?: boolean;
  height?: number;
  libraryClipId?: string;
  objectKey: string;
  parentOutputId?: string;
  platformPreset?: StudioClipsPlatformPreset;
  productId: string;
  revision: number;
  renderRevisionId?: string;
  sha256: string;
  sizeBytes: number;
  taskId: string;
  updatedAt: string;
  videoCodec?: string;
  width?: number;
};
