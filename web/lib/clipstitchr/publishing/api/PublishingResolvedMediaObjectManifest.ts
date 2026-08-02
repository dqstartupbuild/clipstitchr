export type PublishingResolvedMediaObjectManifest = Readonly<{
  audioCodec?: string;
  byteLength: number;
  checksum: string;
  contentType: string;
  durationSeconds?: number;
  hasAudio?: boolean;
  height?: number;
  objectKey: string;
  objectVersion: string;
  orderedIndex: number;
  videoCodec?: string;
  width?: number;
}>;
