import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";

export type PostBridgeAnalyticsSyncResponse = {
  analytics: ContentAnalytics[];
  manualAnalyticsFailedAccountCount: number;
  manualAnalyticsSkippedItemCount: number;
  manualAnalyticsWarning: string | null;
};
