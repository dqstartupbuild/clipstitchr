import { defaultCliprVisualDurationSeconds } from "@/lib/clipstitchr/constants/defaultCliprVisualDurationSeconds";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";

export function getCliprVisualDurationSeconds(value: unknown): CliprDurationSeconds {
  return value === 4 ||
    value === 5 ||
    value === 6 ||
    value === 7 ||
    value === 8 ||
    value === 9 ||
    value === 10
    ? value
    : defaultCliprVisualDurationSeconds;
}
