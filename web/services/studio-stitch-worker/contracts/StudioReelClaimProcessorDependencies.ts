import type { StudioStitchRecipeV1 } from "../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import type { StudioReelWorkerCheckpoint } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerCheckpoint";
import type { StudioReelWorkerClaimRecipe } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerClaimRecipe";
import type { StudioReelWorkerProvider } from "../../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerProvider";
import type { StudioReelCheckpointVoice } from "./StudioReelCheckpointVoice";
import type { StudioReelCheckpointReactionAsset } from "./StudioReelCheckpointReactionAsset";
import type { StudioReelCheckpointReactionSelection } from "./StudioReelCheckpointReactionSelection";
import type { StudioReelReactionAcquisition } from "./StudioReelReactionAcquisition";
import type { StudioReelExecutionSnapshot } from "./StudioReelExecutionSnapshot";
import type { StudioReelGeminiAnalysis } from "./StudioReelGeminiAnalysis";
import type { StudioReelLocalAsset } from "./StudioReelLocalAsset";
import type { StudioReelMediaProbe } from "./StudioReelMediaProbe";
import type { StudioReelVoiceArtifact } from "./StudioReelVoiceArtifact";
import type { StudioReelWorkerWorkspace } from "./StudioReelWorkerWorkspace";

export type StudioReelClaimProcessorDependencies = {
  readonly acquireAssets: (
    recipe: StudioReelWorkerClaimRecipe,
    workspace: StudioReelWorkerWorkspace,
  ) => Promise<readonly StudioReelLocalAsset[]>;
  readonly acquireReactionAssets: (
    recipe: StudioStitchRecipeV1,
    selections: readonly StudioReelCheckpointReactionSelection[],
    workspace: StudioReelWorkerWorkspace,
  ) => Promise<StudioReelReactionAcquisition>;
  readonly analyzeDemo: (
    recipe: StudioStitchRecipeV1,
    assets: readonly StudioReelLocalAsset[],
  ) => Promise<StudioReelGeminiAnalysis>;
  readonly assertActive: (
    checkpoint: StudioReelWorkerCheckpoint,
    recipeIndex: number,
  ) => Promise<void>;
  readonly checkpoint: (input: {
    checkpoint: Exclude<StudioReelWorkerCheckpoint, "completed">;
    expectedRevision: number;
    recipeIndex: number;
    snapshot: StudioReelExecutionSnapshot;
  }) => Promise<number>;
  readonly createVoice: (
    recipe: Extract<StudioStitchRecipeV1, { pipeline: "talkingVideo" }>,
    workspace: StudioReelWorkerWorkspace,
  ) => Promise<StudioReelVoiceArtifact>;
  readonly progress: (input: {
    checkpoint: StudioReelWorkerCheckpoint;
    code:
      | "sources_acquired"
      | "gemini_ready"
      | "voice_ready"
      | "rendered"
      | "output_stored";
    progressPercent: number;
    recipeIndex: number;
  }) => Promise<void>;
  readonly probeOutput: (
    localPath: string,
    workspace: StudioReelWorkerWorkspace,
  ) => Promise<StudioReelMediaProbe>;
  readonly render: (input: {
    assets: readonly StudioReelLocalAsset[];
    recipe: StudioStitchRecipeV1;
    voice?: StudioReelVoiceArtifact;
    workspace: StudioReelWorkerWorkspace;
  }) => Promise<string>;
  readonly reserve: (
    provider: StudioReelWorkerProvider,
    recipeId: string,
    invocationId: string,
  ) => Promise<void>;
  readonly restoreVoice: (
    voice: StudioReelCheckpointVoice,
    workspace: StudioReelWorkerWorkspace,
  ) => Promise<StudioReelVoiceArtifact>;
  readonly restoreReactionAssets: (
    assets: readonly StudioReelCheckpointReactionAsset[],
    workspace: StudioReelWorkerWorkspace,
  ) => Promise<readonly StudioReelLocalAsset[]>;
  readonly selectReactionSources: (
    recipe: StudioStitchRecipeV1,
  ) => Promise<readonly StudioReelCheckpointReactionSelection[]>;
  readonly storeOutput: (input: {
    localPath: string;
    probe: StudioReelMediaProbe;
    recipe: StudioStitchRecipeV1;
  }) => Promise<{
    objectKey: string;
    objectVersion: string;
    sha256: string;
    sizeBytes: number;
  }>;
  readonly storeVoice: (input: {
    recipe: Extract<StudioStitchRecipeV1, { pipeline: "talkingVideo" }>;
    voice: StudioReelVoiceArtifact;
  }) => Promise<StudioReelCheckpointVoice>;
  readonly withWorkspace: <Result>(
    operation: (workspace: StudioReelWorkerWorkspace) => Promise<Result>,
  ) => Promise<Result>;
};
