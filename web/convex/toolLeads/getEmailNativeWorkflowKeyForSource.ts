import type { Doc } from "../_generated/dataModel";

export function getEmailNativeWorkflowKeyForSource(
  source: Doc<"toolLeadCaptures">["source"],
) {
  if (source === "five-day-app-content-sprint") {
    return "five_day_content_sprint_enrolled" as const;
  }
  if (source === "ugc-to-app-ad-mini-course") {
    return "ugc_app_ad_course_enrolled" as const;
  }
  if (source === "app-creative-testing-system-workshop") {
    return "creative_testing_workshop_enrolled" as const;
  }

  return null;
}
