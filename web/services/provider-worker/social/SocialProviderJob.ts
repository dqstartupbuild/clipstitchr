import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";

export type SocialProviderJob = {
  id: string;
  inputSnapshotJson: string;
  jobType:
    | "social-publish"
    | "social-status-reconcile"
    | "social-analytics-refresh"
    | "social-capability-refresh";
  ownerId: string;
  planKeySnapshot: PlanKey;
};
