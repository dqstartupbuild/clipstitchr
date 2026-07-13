import type { BlueprintTestingObjective } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintTestingObjective";

export const blueprintTestingObjectiveOptions: Array<{
  label: string;
  value: BlueprintTestingObjective;
}> = [
  { label: "Find a winning message", value: "winning-message" },
  { label: "Improve the opening", value: "opening" },
  { label: "Make product proof clearer", value: "product-proof" },
  { label: "Improve conversion intent", value: "conversion-intent" },
  { label: "Refresh tired creative", value: "creative-refresh" },
];
