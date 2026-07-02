import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";

export type ManualContentAnalyticsAccountSyncResult = {
  analytics: ContentAnalytics[];
  failedAccountCount: number;
  skippedItemCount: number;
};
