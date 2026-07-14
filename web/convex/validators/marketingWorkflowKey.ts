import { v } from "convex/values";

export const marketingWorkflowKeyValidator = v.union(
  v.literal("tool_lead_captured"),
  v.literal("five_day_content_sprint_enrolled"),
  v.literal("ugc_app_ad_course_enrolled"),
  v.literal("creative_testing_workshop_enrolled"),
);
