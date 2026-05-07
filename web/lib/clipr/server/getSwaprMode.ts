import type { SwaprMode } from "@/lib/clipr/types/SwaprMode";

export function getSwaprMode(value: string): SwaprMode {
  return value === "std" ? "std" : "pro";
}
