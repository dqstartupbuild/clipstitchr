import type { ThirtyDayContentAction } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/ThirtyDayContentAction";
import type { ThirtyDayContentPlanInput } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/ThirtyDayContentPlanInput";
import { getThirtyDayNonPublishAction } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/getThirtyDayNonPublishAction";
import { getThirtyDayPlanDate } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/getThirtyDayPlanDate";
import { getThirtyDayPublishAsset } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/getThirtyDayPublishAsset";
import { thirtyDayCtaByGoal } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/thirtyDayCtaByGoal";
import { thirtyDayGoalAngles } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/thirtyDayGoalAngles";
import { thirtyDayPublishOffsetsByCadence } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/thirtyDayPublishOffsetsByCadence";

export function createThirtyDayContentPlan(
  input: ThirtyDayContentPlanInput,
): ThirtyDayContentAction[] {
  const publishOffsets: readonly number[] =
    thirtyDayPublishOffsetsByCadence[input.postsPerWeek];
  const appName = input.appName.trim() || "Your app";
  let publishIndex = 0;
  let nonPublishIndex = 0;

  return Array.from({ length: 30 }, (_, index) => {
    const dayNumber = index + 1;
    const date = getThirtyDayPlanDate(input.startDate, index);
    const isPublishDay = publishOffsets.includes(index % 7);

    if (isPublishDay) {
      const angle = thirtyDayGoalAngles[input.goal][publishIndex % 4];
      const asset = getThirtyDayPublishAsset(input, publishIndex);
      const stagePhrase =
        input.launchStage === "prelaunch"
          ? "Keep the unavailable product or feature clearly labeled as upcoming."
          : input.launchStage === "launch"
            ? "Connect the post to the current launch without fake urgency."
            : input.launchStage === "growth"
              ? "Show one current product truth to a specific audience."
              : "Make the post useful without relying on a launch moment.";
      publishIndex += 1;

      return {
        asset,
        date,
        dayNumber,
        detail: `${angle} using ${asset}. ${stagePhrase} ${thirtyDayCtaByGoal[input.goal]}`,
        kind: "publish",
        title: `Publish: ${angle} for ${appName}`,
      };
    }

    const action = getThirtyDayNonPublishAction(input, nonPublishIndex);
    nonPublishIndex += 1;
    return { ...action, date, dayNumber };
  });
}
