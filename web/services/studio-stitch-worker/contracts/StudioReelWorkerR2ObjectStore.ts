import type { StudioReelWorkerAssetManifest } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerAssetManifest";
import type { StudioReelWorkerR2Proof } from "./StudioReelWorkerR2Proof";

export type StudioReelWorkerR2ObjectStore = {
  readonly downloadFile: (input: {
    readonly manifest: StudioReelWorkerAssetManifest;
    readonly maximumBytes: number;
    readonly outputPath: string;
    readonly ownerId: string;
  }) => Promise<{ readonly sha256Hex: string }>;
  readonly putFileVerified: (input: {
    readonly contentType: string;
    readonly localPath: string;
    readonly maximumBytes: number;
    readonly objectKey: string;
    readonly ownerId: string;
    readonly sizeBytes: number;
  }) => Promise<StudioReelWorkerR2Proof>;
};
