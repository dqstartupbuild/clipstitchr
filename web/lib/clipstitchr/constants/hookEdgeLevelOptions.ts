import type { HookEdgeLevel } from "@/lib/clipstitchr/types/HookEdgeLevel";

export const hookEdgeLevelOptions: {
  label: string;
  value: HookEdgeLevel;
}[] = [
  { label: "Safe", value: "safe" },
  { label: "Punchy", value: "punchy" },
  { label: "Bold", value: "bold" },
];
