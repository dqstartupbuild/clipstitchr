import type { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

export async function assertStudioBetaProviderWorkerAccess(
  client: ConvexHttpClient,
  providerWorkerSecret: string,
  ownerId: string,
) {
  if (process.env.STUDIO_BETA_ENABLED !== "true") {
    throw new Error("Studio Beta work is disabled.");
  }

  await client.mutation(
    anyApi["studioBetaAccess/assertProviderWorkerStudioBetaAccess"]
      .assertProviderWorkerStudioBetaAccess,
    {
      ownerId,
      secret: providerWorkerSecret,
    },
  );
}
