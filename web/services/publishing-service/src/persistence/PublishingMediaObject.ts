export type PublishingMediaObject = Readonly<{
  orderedIndex: number;
  objectKey: string;
  objectVersion: string;
  checksum: string;
  byteLength: number;
  contentType: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  videoCodec?: string;
  audioCodec?: string;
  hasAudio?: boolean;
}>;
