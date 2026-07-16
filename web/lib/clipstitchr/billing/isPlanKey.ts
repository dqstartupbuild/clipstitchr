import type { PlanKey } from "./types/PlanKey";

export function isPlanKey(value: unknown): value is PlanKey {
  return value === "starter" || value === "pro" || value === "agency";
}
