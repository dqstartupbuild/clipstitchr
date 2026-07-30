import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { SocialAnalyticsSnapshot } from "./SocialAnalyticsSnapshot";

export async function recordSocialAnalyticsPublicationResult({
  client,
  ownerId,
  providerWorkerSecret,
  publicationId,
  refreshRunId,
  snapshots,
  succeeded,
}: {
  client: ConvexHttpClient;
  ownerId: string;
  providerWorkerSecret: string;
  publicationId: string;
  refreshRunId: string;
  snapshots: SocialAnalyticsSnapshot[];
  succeeded: boolean;
}) {
  await client.mutation(
    api.socialAnalytics.recordSocialAnalyticsPublicationResult
      .recordSocialAnalyticsPublicationResult,
    {
      secret: providerWorkerSecret,
      ownerId,
      refreshRunId,
      publicationId,
      snapshots,
      succeeded,
      now: new Date().toISOString(),
    },
  );
}
