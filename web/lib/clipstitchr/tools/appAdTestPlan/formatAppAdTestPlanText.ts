import type { AppAdTestPlanResult } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanResult";
import { formatAppAdTestPlanUsd } from "@/lib/clipstitchr/tools/appAdTestPlan/formatAppAdTestPlanUsd";

export function formatAppAdTestPlanText(result: AppAdTestPlanResult) {
  return [
    `${result.appName} — APP AD CREATIVE TEST PLAN`,
    "",
    "GOAL",
    result.goal,
    "",
    "AUDIENCE",
    result.audience,
    "",
    "HYPOTHESIS",
    result.hypothesis,
    "",
    "OPPORTUNITY",
    `${result.possibleCombinationCount} total possible combinations`,
    `${result.practicalFirstBatchCount} ads in a practical first batch`,
    `${result.totalPlannedVariantCount} variants across ready waves`,
    "",
    "THREE-WAVE PLAN",
    ...result.waves.flatMap((wave) => [
      `Wave ${wave.waveNumber}: ${wave.name} — ${wave.status === "ready" ? `${wave.variantCount} variants` : "needs more assets"}`,
      wave.instruction,
      `Hold constant: ${wave.holdConstant.join(", ")}`,
    ]),
    "",
    "WEEKLY ORDER",
    ...(result.schedule.length
      ? result.schedule.map(
          (week) =>
            `Week ${week.weekNumber}: ${week.variantCount} variants for ${week.waveName}${week.budgetPerLiveVariant === undefined ? "" : ` — ${formatAppAdTestPlanUsd(week.budgetPerLiveVariant)} planning allocation per live variant`}`,
        )
      : ["No wave is ready yet. Use the preparation list first."]),
    "",
    "PREPARATION",
    ...(result.preparationItems.length
      ? result.preparationItems.map((item) => `- ${item}`)
      : ["- Your current asset counts support all three waves."]),
    "",
    "MEASUREMENT RULE",
    "Compare one variable at a time using the same measurement window and comparable delivery opportunity. The arithmetic does not predict a winner.",
  ].join("\n");
}
