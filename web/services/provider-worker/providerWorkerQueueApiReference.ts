import { anyApi } from "convex/server";

export const providerWorkerQueueApiReference =
  anyApi["workerQueue/claimNextWorkerQueueEntry"].claimNextWorkerQueueEntry;
