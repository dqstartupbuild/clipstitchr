export type StudioReelWorkerDurableOutput = {
  readonly recipeId: string;
  readonly objectKey: string;
  readonly objectVersion: string;
  readonly contentType: "video/mp4";
  readonly sizeBytes: number;
  readonly sha256: string;
  readonly durationSeconds: number;
  readonly width: number;
  readonly height: number;
  readonly hasAudio: boolean;
  readonly videoCodec: string;
  readonly audioCodec?: string;
};
