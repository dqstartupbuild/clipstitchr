import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export type SocialAnalyticsReport = FunctionReturnType<
  typeof api.socialAnalytics.getSocialAnalyticsReport.getSocialAnalyticsReport
>;
