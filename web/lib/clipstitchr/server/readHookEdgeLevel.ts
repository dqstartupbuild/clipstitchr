import { hookEdgeLevelOptions } from "@/lib/clipstitchr/constants/hookEdgeLevelOptions";
import type { HookEdgeLevel } from "@/lib/clipstitchr/types/HookEdgeLevel";

const hookEdgeLevels = new Set<string>(
  hookEdgeLevelOptions.map((option) => option.value),
);

export function readHookEdgeLevel(value: unknown): HookEdgeLevel | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const edgeLevel = value.trim();

  return hookEdgeLevels.has(edgeLevel) ? (edgeLevel as HookEdgeLevel) : undefined;
}
