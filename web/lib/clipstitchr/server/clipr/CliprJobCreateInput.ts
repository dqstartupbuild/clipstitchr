import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprLipSyncModelId } from "@/lib/clipstitchr/types/CliprLipSyncModelId";
import type { CliprTtsModelId } from "@/lib/clipstitchr/types/CliprTtsModelId";

export type CliprJobCreateInput = {
  addMusic: boolean;
  avatarId: string;
  avatarSceneLocation?: string;
  avatarSceneOutfit?: string;
  avatarScenePose?: string;
  durationSeconds: CliprDurationSeconds;
  jobId: string;
  lipSyncModelId: CliprLipSyncModelId;
  musicTrackId: string;
  productId: string;
  scriptIdea?: string;
  ttsModelId: CliprTtsModelId;
  voiceId: string;
};
