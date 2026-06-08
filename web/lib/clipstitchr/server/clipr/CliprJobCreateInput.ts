import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";

export type CliprJobCreateInput = {
  addMusic: boolean;
  avatarId: string;
  avatarSceneLocation?: string;
  avatarSceneOutfit?: string;
  avatarScenePose?: string;
  durationSeconds: CliprDurationSeconds;
  jobId: string;
  musicTrackId: string;
  productId: string;
  scriptIdea?: string;
  voiceId: string;
};
