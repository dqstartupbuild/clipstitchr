export type PublishingMediaRecord = {
  durability: "durable";
  kind: "stitch" | "swipe" | "library-media";
  mediaObjects: Array<{
    checksum?: string;
    contentType: string;
    durationSeconds?: number;
    hasAudio?: boolean;
    height?: number;
    objectKey: string;
    sizeBytes: number;
    version?: string;
    width?: number;
  }>;
  ownerId: string;
  recordId: string;
};
