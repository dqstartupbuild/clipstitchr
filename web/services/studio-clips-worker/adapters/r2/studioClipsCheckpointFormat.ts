export const STUDIO_CLIPS_MAXIMUM_CHECKPOINT_BYTES = 4_194_304;
export const STUDIO_CLIPS_CHECKPOINT_FILE_TOKEN_PREFIX = "checkpoint-file:";

export type StudioClipsCheckpointFileReference = {
  contentType: string;
  fileName: string;
  id: string;
  key: string;
  sha256Hex: string;
  sizeBytes: number;
};
