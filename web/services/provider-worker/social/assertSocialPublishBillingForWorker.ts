import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { SocialNeedsAttentionError } from "./SocialNeedsAttentionError";

export async function assertSocialPublishBillingForWorker({
  client,
  ownerId,
  providerWorkerSecret,
}: {
  client: ConvexHttpClient;
  ownerId: string;
  providerWorkerSecret: string;
}) {
  try {
    await client.query(
      api.socialPublishing.assertSocialPublishBillingForProvider
        .assertSocialPublishBillingForProvider,
      {
        secret: providerWorkerSecret,
        ownerId,
        now: new Date().toISOString(),
      },
    );
  } catch {
    throw new SocialNeedsAttentionError(
      "Your subscription needs attention before this post can continue.",
    );
  }
}
