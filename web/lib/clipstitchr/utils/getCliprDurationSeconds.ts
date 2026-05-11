import { CLIPR_DEFAULT_DURATION_SECONDS } from "@/lib/clipstitchr/constants/cliprDurationOptions";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";

export function getCliprDurationSeconds(value: string): CliprDurationSeconds {
  const duration = Number(value);

  return duration === 60 ? 60 : CLIPR_DEFAULT_DURATION_SECONDS;
}
