import type { ClientContentCapacityStageInput } from "@/lib/clipstitchr/tools/clientContentCapacity/ClientContentCapacityStageInput";
import type { ClientContentCapacityStageResult } from "@/lib/clipstitchr/tools/clientContentCapacity/ClientContentCapacityStageResult";
import { clientContentCapacityInputLimits } from "@/lib/clipstitchr/tools/clientContentCapacity/clientContentCapacityInputLimits";
import { normalizeBoundedDecimal } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedDecimal";

export function calculateClientContentStageCapacity(
  key: ClientContentCapacityStageResult["key"],
  label: string,
  stage: ClientContentCapacityStageInput,
  productiveTimePercent: number,
): ClientContentCapacityStageResult {
  const availableHours = normalizeBoundedDecimal(
    stage.availableHoursPerWeek,
    clientContentCapacityInputLimits.hours,
  );
  const hoursPerDeliverable = normalizeBoundedDecimal(
    stage.hoursPerDeliverable,
    clientContentCapacityInputLimits.hours,
  );
  const effectiveHours = availableHours * (productiveTimePercent / 100);

  return {
    deliverableCapacity:
      hoursPerDeliverable === 0 ? null : effectiveHours / hoursPerDeliverable,
    effectiveHours,
    key,
    label,
  };
}
