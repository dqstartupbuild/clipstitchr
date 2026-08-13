export type PublishingMediaRecord = {
  durability: "durable";
  kind:
    | "stitch"
    | "swipe"
    | "library-media"
    | "studio-clip-output"
    | "studio-stitch-output";
  mediaObjects: Array<{
    audioCodec?: string;
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
  }>;
  ownerId: string;
  recordId: string;
};
