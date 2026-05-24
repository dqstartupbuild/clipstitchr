import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";

export type CliprJobCreateInput = {
  addMusic: boolean;
  avatarId: string;
  contentType: CliprContentType;
  durationSeconds: CliprDurationSeconds;
  jobId: string;
  musicTrackId: string;
  productId: string;
  voiceId: string;
};
