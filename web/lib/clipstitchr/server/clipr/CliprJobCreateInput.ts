import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";

export type CliprJobCreateInput = {
  addMusic: boolean;
  avatarId: string;
  durationSeconds: CliprDurationSeconds;
  jobId: string;
  musicTrackId: string;
  productId: string;
  voiceId: string;
};
