import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

export type PostBridgeAnalyticsLoadResult = {
  analytics: PostBridgeAnalytics[];
  lastSyncedAt: string | null;
  stale: boolean;
  syncTriggered: boolean;
};
