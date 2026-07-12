import type { ConvexHttpClient } from "convex/browser";
import type { HookLabAnalysisJob } from "./HookLabAnalysisJob";

export type ProcessHookLabIdeaAnalysisOptions = {
  client: ConvexHttpClient;
  job: HookLabAnalysisJob;
  providerWorkerSecret: string;
};
