import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";

export function getSwaprMode(value: string): SwaprMode {
  return value === "std" ? "std" : "pro";
}
