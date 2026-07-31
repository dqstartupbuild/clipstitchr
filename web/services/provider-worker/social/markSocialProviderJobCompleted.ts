import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { SocialProviderJob } from "./SocialProviderJob";

export async function markSocialProviderJobCompleted({
  client,
  job,
  providerWorkerSecret,
  stage,
}: {
  client: ConvexHttpClient;
  job: SocialProviderJob;
  providerWorkerSecret: string;
  stage: string;
}) {
  await client.mutation(api.providerJobs.markProviderStatus, {
    secret: providerWorkerSecret,
    ownerId: job.ownerId,
    id: job.id,
    status: "completed",
    stage,
    progress: 1,
    updatedAt: new Date().toISOString(),
  });
}
