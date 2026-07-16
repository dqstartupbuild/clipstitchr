import type { Prediction } from "replicate";
import type { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import { assertR2ObjectKeyBelongsToUser } from "@/lib/clipstitchr/server/r2/assertR2ObjectKeyBelongsToUser";
import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { deleteR2Objects } from "@/lib/clipstitchr/server/r2/deleteR2Objects";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { ProviderImageJob } from "./ProviderImageJob";

const api = anyApi;
const SWAPR_OUTPAINT_MODEL_ID = "black-forest-labs/flux-fill-pro";

type SwaprPhotoExpansionJobInput = {
  imageObject: R2ObjectReference;
  maskObject: R2ObjectReference;
  outputRecordId: string;
  prompt: string;
};

function parseObject(value: unknown, label: string): R2ObjectReference {
  if (!value || typeof value !== "object") {
    throw new Error(`Swapr photo expansion ${label} is missing.`);
  }

  const object = value as Partial<R2ObjectReference>;

  if (!object.key || !object.contentType || typeof object.size !== "number") {
    throw new Error(`Swapr photo expansion ${label} is invalid.`);
  }

  return {
    contentType: object.contentType,
    key: object.key,
    size: object.size,
  };
}

function parseInput(inputSnapshotJson: string): SwaprPhotoExpansionJobInput {
  const input = JSON.parse(inputSnapshotJson) as Record<string, unknown>;

  if (
    typeof input.outputRecordId !== "string" ||
    typeof input.prompt !== "string"
  ) {
    throw new Error("Swapr photo expansion job input is incomplete.");
  }

  return {
    imageObject: parseObject(input.imageObject, "image"),
    maskObject: parseObject(input.maskObject, "mask"),
    outputRecordId: input.outputRecordId,
    prompt: input.prompt,
  };
}

export async function processSwaprPhotoExpansion(
  client: ConvexHttpClient,
  job: ProviderImageJob,
  providerWorkerSecret: string,
) {
  const input = parseInput(job.inputSnapshotJson);
  const inputKeys = [input.imageObject.key, input.maskObject.key];

  try {
    for (const key of inputKeys) {
      assertR2ObjectKeyBelongsToUser(key, job.ownerId);
    }

    const replicate = createReplicateClient();
    const existingPredictionId = job.providerJobIds[0];
    const [image, mask] = await Promise.all([
      getR2DownloadSignedUrl(input.imageObject.key),
      getR2DownloadSignedUrl(input.maskObject.key),
    ]);
    const prediction = existingPredictionId
      ? await replicate.predictions.get(existingPredictionId)
      : await replicate.predictions.create({
          model: SWAPR_OUTPAINT_MODEL_ID,
          input: {
            image: image.url,
            mask: mask.url,
            prompt: input.prompt,
            steps: 40,
            guidance: 55,
            safety_tolerance: 2,
            prompt_upsampling: false,
            output_format: "jpg",
          },
        });

    if (!existingPredictionId) {
      await client.mutation(api.providerJobs.markProviderStatus, {
        secret: providerWorkerSecret,
        ownerId: job.ownerId,
        id: job.id,
        status: "running",
        stage: "provider-created",
        providerJobId: prediction.id,
        progress: 0.2,
        updatedAt: new Date().toISOString(),
      });
    }

    const completedPrediction = await replicate.wait(prediction, {
      interval: 2_000,
    });

    if (completedPrediction.status !== "succeeded") {
      throw new Error(
        typeof completedPrediction.error === "string"
          ? completedPrediction.error
          : "Replicate did not complete photo expansion.",
      );
    }

    const outputUrl = getReplicateOutputUrl(
      (completedPrediction as Prediction).output,
    );
    const outputResponse = await fetchReplicateOutput(outputUrl);
    const contentType =
      outputResponse.headers.get("content-type") ?? "image/jpeg";
    const body = await outputResponse.arrayBuffer();
    const outputObject = await putR2Object({
      body,
      contentType,
      key: createR2ObjectKey({
        contentType,
        kind: "provider-output-image",
        recordId: input.outputRecordId,
        userId: job.ownerId,
      }),
    });

    await client.mutation(api.providerJobs.markProviderStatus, {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      id: job.id,
      status: "completed",
      stage: "completed",
      outputAssetId: outputObject.key,
      providerJobId: completedPrediction.id,
      progress: 1,
      updatedAt: new Date().toISOString(),
    });
  } finally {
    await deleteR2Objects(inputKeys).catch(() => null);
  }
}
