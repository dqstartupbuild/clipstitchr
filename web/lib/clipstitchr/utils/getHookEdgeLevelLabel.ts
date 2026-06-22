import { hookEdgeLevelOptions } from "@/lib/clipstitchr/constants/hookEdgeLevelOptions";
import type { HookEdgeLevel } from "@/lib/clipstitchr/types/HookEdgeLevel";

export function getHookEdgeLevelLabel(value?: HookEdgeLevel) {
  return (
    hookEdgeLevelOptions.find((option) => option.value === value)?.label ??
    "Punchy"
  );
}
