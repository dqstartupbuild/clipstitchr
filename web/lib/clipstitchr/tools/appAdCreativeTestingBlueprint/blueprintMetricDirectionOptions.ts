import type { BlueprintMetricDirection } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintMetricDirection";

export const blueprintMetricDirectionOptions: Array<{
  label: string;
  value: BlueprintMetricDirection;
}> = [
  { label: "Higher is better", value: "higher" },
  { label: "Lower is better", value: "lower" },
];
