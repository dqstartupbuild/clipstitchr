export type PublishingWorkflowMediaObject = Readonly<{
  orderedIndex: number;
  objectKey: string;
  version: string;
  checksum: string;
  byteLength: number;
  contentType: "image/jpeg" | "image/png" | "image/webp" | "video/mp4";
  durationSeconds: number | null;
}>;
