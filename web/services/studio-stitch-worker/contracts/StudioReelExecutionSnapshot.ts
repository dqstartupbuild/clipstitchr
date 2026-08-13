import type { StudioReelWorkerDurableOutput } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerDurableOutput";
import type { StudioReelCheckpointAnalysis } from "./StudioReelCheckpointAnalysis";
import type { StudioReelCheckpointVoice } from "./StudioReelCheckpointVoice";
import type { StudioReelCheckpointReactionAsset } from "./StudioReelCheckpointReactionAsset";
import type { StudioReelCheckpointReactionSelection } from "./StudioReelCheckpointReactionSelection";

export type StudioReelExecutionSnapshot = {
  readonly schemaVersion: "studio-stitch-execution-v1";
  readonly analyses: readonly StudioReelCheckpointAnalysis[];
  readonly outputs: readonly StudioReelWorkerDurableOutput[];
  readonly reactionAssets: readonly StudioReelCheckpointReactionAsset[];
  readonly reactionSelections: readonly StudioReelCheckpointReactionSelection[];
  readonly voices: readonly StudioReelCheckpointVoice[];
};
