import { anyApi } from "convex/server";

const api = anyApi;

export async function failHookLabMediaJob({
  client,
  config,
  job,
  updatedAt,
}) {
  const input = JSON.parse(job.inputSnapshotJson);
  const providerJobId =
    input && typeof input.providerJobId === "string"
      ? input.providerJobId.trim()
      : "";
  const variantId =
    input && typeof input.hookLabIdeaVariantId === "string"
      ? input.hookLabIdeaVariantId.trim()
      : "";

  if (!providerJobId || !variantId) {
    throw new Error("Hook Lab media failure lineage is incomplete.");
  }

  await client.mutation(
    api["hookLabIdeaVariants/failFinalizationJobFromMediaWorker"]
      .failFinalizationJobFromMediaWorker,
    {
      secret: config.mediaWorkerSecret,
      ownerId: job.ownerId,
      mediaJobId: job.id,
      providerJobId,
      variantId,
      failureCode: "media_finalization_failed",
      failureMessage:
        "We made the opening but could not save the finished Stitch. Try again.",
      updatedAt,
    },
  );
}
