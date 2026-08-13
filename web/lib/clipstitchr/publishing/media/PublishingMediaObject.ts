export type PublishingMediaObject = {
  audioCodec?: string | null;
  checksum?: string;
  contentType: string;
  durationSeconds?: number;
  hasAudio?: boolean;
  height?: number;
  objectKey: string;
  sizeBytes: number;
  version?: string;
  videoCodec?: string;
  width?: number;
};
