import { anyApi } from "convex/server";

export async function assertStudioBetaMediaWorkerAccess(
  client,
  mediaWorkerSecret,
  ownerId,
) {
  if (process.env.STUDIO_BETA_ENABLED !== "true") {
    throw new Error("Studio Beta work is disabled.");
  }

  await client.mutation(
    anyApi["studioBetaAccess/assertMediaWorkerStudioBetaAccess"]
      .assertMediaWorkerStudioBetaAccess,
    {
      ownerId,
      secret: mediaWorkerSecret,
    },
  );
}
