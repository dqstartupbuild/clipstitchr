import { normalizeBlueprintCount } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/normalizeBlueprintCount";

export function normalizeBlueprintOptionalCount(
  value: number | null,
  maximum: number,
): number | null {
  return value === null ? null : normalizeBlueprintCount(value, maximum);
}
