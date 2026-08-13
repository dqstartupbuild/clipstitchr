import type { StudioReelExecutionSnapshot } from "../contracts/StudioReelExecutionSnapshot";

export function createStudioReelExecutionSnapshot(): StudioReelExecutionSnapshot {
  return {
    schemaVersion: "studio-stitch-execution-v1",
    analyses: [],
    outputs: [],
    reactionAssets: [],
    reactionSelections: [],
    voices: [],
  };
}
