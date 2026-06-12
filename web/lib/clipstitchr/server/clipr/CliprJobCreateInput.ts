import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";
import type { CliprLipSyncModelId } from "@/lib/clipstitchr/types/CliprLipSyncModelId";
import type { CliprResolvedGenerationMode } from "@/lib/clipstitchr/types/CliprResolvedGenerationMode";
import type { CliprTtsModelId } from "@/lib/clipstitchr/types/CliprTtsModelId";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";

export type CliprJobCreateInput = {
  addMusic: boolean;
  avatarId: string;
  avatarSceneLocation?: string;
  avatarSceneOutfit?: string;
  avatarScenePose?: string;
  durationSeconds: CliprDurationSeconds;
  generationMode: CliprResolvedGenerationMode;
  jobId: string;
  lipSyncModelId: CliprLipSyncModelId;
  musicTrackId: string;
  productId: string;
  requestedGenerationMode: CliprGenerationMode;
  requestedVideoModelId: CliprVideoModelId;
  scriptIdea?: string;
  ttsModelId: CliprTtsModelId;
  videoModelId: Exclude<CliprVideoModelId, "auto">;
  voiceId: string;
};
