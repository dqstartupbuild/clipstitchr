import type { AppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintInput";

export function getBlueprintCellCapacity(
  input: AppAdCreativeTestingBlueprintInput,
): { activeCapacity: number; fundedCapacity: number | null } {
  const productionCapacity = Math.min(9, input.weeklyProductionCapacity);
  const hasFundingFloor =
    input.weeklyBudget !== null &&
    input.weeklyBudget > 0 &&
    input.minimumSpendPerVariant !== null &&
    input.minimumSpendPerVariant > 0;
  const fundedCapacity = hasFundingFloor
    ? Math.floor(input.weeklyBudget! / input.minimumSpendPerVariant!)
    : null;

  return {
    activeCapacity: Math.max(
      0,
      Math.min(productionCapacity, fundedCapacity ?? productionCapacity),
    ),
    fundedCapacity,
  };
}
