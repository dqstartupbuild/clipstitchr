import type { PublishingListPageInput } from "./PublishingListPageInput.js";

export type ListTenantAnalyticsSnapshotsInput = PublishingListPageInput &
  Readonly<{
    integrationId?: string;
    postStateId?: string;
    observedAtOrAfter?: Date;
  }>;
