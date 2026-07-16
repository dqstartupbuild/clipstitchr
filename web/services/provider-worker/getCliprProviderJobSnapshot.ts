import type { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

const api = anyApi;

export type CliprProviderJobSnapshot = {
  avatarImageObject?: R2ObjectReference;
  avatarImageProviderPredictionId?: string;
  avatarVideoObject?: R2ObjectReference;
  avatarVideoProviderPredictionId?: string;
  providerModels: string[];
  scenePlan?: CliprScenePlan[];
  script?: string;
};

export async function getCliprProviderJobSnapshot(
  client: ConvexHttpClient,
  providerWorkerSecret: string,
  ownerId: string,
  jobId: string,
) {
  return (await client.query(api.cliprJobs.getForProvider.getForProvider, {
    id: jobId,
    ownerId,
    secret: providerWorkerSecret,
  })) as CliprProviderJobSnapshot | null;
}
