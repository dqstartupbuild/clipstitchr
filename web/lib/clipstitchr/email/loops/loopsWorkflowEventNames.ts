import type { LoopsWorkflowEventName } from "./LoopsWorkflowEventName";

export const loopsWorkflowEventNames = [
  "tool_lead_captured",
  "five_day_content_sprint_enrolled",
  "ugc_app_ad_course_enrolled",
  "creative_testing_workshop_enrolled",
] as const satisfies readonly LoopsWorkflowEventName[];
