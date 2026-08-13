import type { StudioClipsProgressCode } from "../contracts/StudioClipsProgressCode";

const progressPercentByCode: Record<StudioClipsProgressCode, number> = {
  analyzed: 62,
  b_roll_ready: 72,
  cancelled: 0,
  completed: 100,
  failed: 0,
  media_validated: 24,
  output_stored: 97,
  rendered: 92,
  source_acquired: 15,
  transcribed: 44,
  worker_started: 1,
};

export function getStudioClipsProgressPercent(
  code: StudioClipsProgressCode,
): number {
  return progressPercentByCode[code];
}
