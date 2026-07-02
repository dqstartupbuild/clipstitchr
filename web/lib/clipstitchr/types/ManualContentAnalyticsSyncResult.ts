import type { ManualContentAnalyticsAccountSyncResult } from "@/lib/clipstitchr/types/ManualContentAnalyticsAccountSyncResult";

export type ManualContentAnalyticsSyncResult =
  ManualContentAnalyticsAccountSyncResult & {
    warning: string | null;
  };
