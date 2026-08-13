import type { StudioReelWorkerAssetManifest } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerAssetManifest";

export type StudioReelLocalAsset = {
  readonly localPath: string;
  readonly manifest: StudioReelWorkerAssetManifest;
};
