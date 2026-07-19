import { anyApi } from "convex/server";

export const mediaWorkerQueueApiReference =
  anyApi["workerQueue/claimNextWorkerQueueEntry"].claimNextWorkerQueueEntry;
