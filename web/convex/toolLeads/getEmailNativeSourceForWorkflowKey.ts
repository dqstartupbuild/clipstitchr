import type { Doc } from "../_generated/dataModel";

export function getEmailNativeSourceForWorkflowKey(
  workflowKey: Doc<"marketingWorkflowEnrollments">["workflowKey"],
) {
  if (workflowKey === "five_day_content_sprint_enrolled") {
    return "five-day-app-content-sprint" as const;
  }
  if (workflowKey === "ugc_app_ad_course_enrolled") {
    return "ugc-to-app-ad-mini-course" as const;
  }
  if (workflowKey === "creative_testing_workshop_enrolled") {
    return "app-creative-testing-system-workshop" as const;
  }

  return null;
}
