import { defaultCliprDurationSeconds } from "@/lib/clipstitchr/constants/defaultCliprDurationSeconds";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";

export function getCliprDurationSeconds(value: unknown): CliprDurationSeconds {
  return value === 60 ? 60 : defaultCliprDurationSeconds;
}
