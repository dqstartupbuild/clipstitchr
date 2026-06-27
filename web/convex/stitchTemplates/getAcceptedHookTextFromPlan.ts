import type { Doc } from "../_generated/dataModel";

export function getAcceptedHookTextFromPlan(plan: Doc<"stitchrHookPlans">) {
  const acceptedOption = plan.hookOptions.find(
    (option) => option.feedbackStatus === "accepted" && option.text.trim(),
  );

  if (acceptedOption) {
    return acceptedOption.text;
  }

  return plan.feedbackStatus === "accepted" && plan.selectedHook.trim()
    ? plan.selectedHook
    : undefined;
}
