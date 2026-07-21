import type { ConvexHttpClient } from "convex/browser";

export type ProcessHookLabPostAnalysisOptions = {
  client: ConvexHttpClient;
  job: {
    id: string;
    inputSnapshotJson: string;
    ownerId: string;
    stage: string;
    usageReservationId?: string;
  };
  providerWorkerSecret: string;
};
