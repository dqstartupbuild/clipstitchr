import { defaultCliprDurationSeconds } from "@/lib/clipstitchr/constants/defaultCliprDurationSeconds";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";

export function getCliprDurationSeconds(value: unknown): CliprDurationSeconds {
  return value === 4 ||
    value === 5 ||
    value === 6 ||
    value === 7 ||
    value === 8 ||
    value === 9 ||
    value === 10 ||
    value === 30 ||
    value === 60
    ? value
    : defaultCliprDurationSeconds;
}
