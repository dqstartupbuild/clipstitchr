import type { StudioStitchAssetRef } from "../studioStitch/StudioStitchAssetRef";

export type StudioReelWorkerAssetManifest = {
  readonly source: StudioStitchAssetRef;
  readonly objectKey: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly durationSeconds: number;
  readonly width?: number;
  readonly height?: number;
  readonly hasAudio?: boolean;
  readonly sha256?: string;
  readonly objectVersion?: string;
};
