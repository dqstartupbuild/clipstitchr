import type { ClientContentCapacityInput } from "@/lib/clipstitchr/tools/clientContentCapacity/ClientContentCapacityInput";
import type { ClientContentCapacityResult } from "@/lib/clipstitchr/tools/clientContentCapacity/ClientContentCapacityResult";
import { calculateClientContentStageCapacity } from "@/lib/clipstitchr/tools/clientContentCapacity/calculateClientContentStageCapacity";
import { clientContentCapacityInputLimits } from "@/lib/clipstitchr/tools/clientContentCapacity/clientContentCapacityInputLimits";
import { normalizeBoundedCount } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedCount";
import { normalizeBoundedDecimal } from "@/lib/clipstitchr/tools/numbers/normalizeBoundedDecimal";

export function calculateClientContentCapacity(
  input: ClientContentCapacityInput,
): ClientContentCapacityResult {
  const productiveTimePercent = normalizeBoundedDecimal(
    input.productiveTimePercent,
    clientContentCapacityInputLimits.percent,
  );
  const stageResults = [
    calculateClientContentStageCapacity(
      "capture",
      "Capture",
      input.capture,
      productiveTimePercent,
    ),
    calculateClientContentStageCapacity(
      "editing",
      "Editing",
      input.editing,
      productiveTimePercent,
    ),
    calculateClientContentStageCapacity(
      "review",
      "Review",
      input.review,
      productiveTimePercent,
    ),
  ];
  const capacities = stageResults.flatMap((stage) =>
    stage.deliverableCapacity === null ? [] : [stage.deliverableCapacity],
  );
  const hasAllStageInputs = capacities.length === stageResults.length;
  const weeklyDeliverableCapacity = hasAllStageInputs
    ? Math.floor(Math.min(...capacities))
    : null;
  const limitingStage =
    weeklyDeliverableCapacity === null
      ? null
      : stageResults.reduce((lowest, stage) =>
          (stage.deliverableCapacity ?? Infinity) <
          (lowest.deliverableCapacity ?? Infinity)
            ? stage
            : lowest,
        );
  const deliverablesPerClientPerWeek = normalizeBoundedDecimal(
    input.deliverablesPerClientPerWeek,
    clientContentCapacityInputLimits.deliverableCount,
  );
  const currentClientCount = normalizeBoundedCount(
    input.currentClientCount,
    clientContentCapacityInputLimits.clientCount,
  );
  const clientCapacity =
    weeklyDeliverableCapacity === null || deliverablesPerClientPerWeek === 0
      ? null
      : Math.floor(weeklyDeliverableCapacity / deliverablesPerClientPerWeek);
  const utilizationPercent =
    weeklyDeliverableCapacity === null || weeklyDeliverableCapacity === 0
      ? null
      : ((currentClientCount * deliverablesPerClientPerWeek) /
          weeklyDeliverableCapacity) *
        100;
  const requiredWeeklyDeliverables =
    currentClientCount * deliverablesPerClientPerWeek;

  return {
    clientCapacity,
    currentClientCount,
    deliverablesPerClientPerWeek,
    isOverCapacity:
      (weeklyDeliverableCapacity === 0 && requiredWeeklyDeliverables > 0) ||
      (utilizationPercent !== null && utilizationPercent > 100),
    limitingStage,
    productiveTimePercent,
    stageResults,
    utilizationPercent,
    weeklyDeliverableCapacity,
  };
}
