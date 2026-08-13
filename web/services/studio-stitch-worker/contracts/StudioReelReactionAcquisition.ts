import type { StudioReelCheckpointReactionAsset } from "./StudioReelCheckpointReactionAsset";
import type { StudioReelLocalAsset } from "./StudioReelLocalAsset";

export type StudioReelReactionAcquisition = {
  readonly assets: readonly StudioReelLocalAsset[];
  readonly checkpointAssets: readonly StudioReelCheckpointReactionAsset[];
};
