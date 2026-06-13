import { createCliprDemoVideo } from "@/lib/clipstitchr/server/createCliprDemoVideo";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { saveCliprAvatarVideoObject } from "@/lib/clipstitchr/server/saveCliprAvatarVideoObject";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprDemoVideoOutputOptions = {
  demoClipName: string;
  demoVideoDescription?: string;
  durationSeconds: number;
  jobId: string;
  product: ProductProfile;
  referenceVideoUrl: string;
  replicate: ReplicateClient;
  userId: string;
};

export async function createCliprDemoVideoOutput({
  demoClipName,
  demoVideoDescription,
  durationSeconds,
  jobId,
  product,
  referenceVideoUrl,
  replicate,
  userId,
}: CreateCliprDemoVideoOutputOptions) {
  const generatedVideo = await createCliprDemoVideo({
    demoClipName,
    demoVideoDescription,
    durationSeconds,
    product,
    referenceVideoUrl,
    replicate,
  });
  const avatarVideoObject = await saveCliprAvatarVideoObject({
    body: generatedVideo.body,
    contentType: generatedVideo.contentType,
    jobId,
    userId,
  });

  return {
    avatarVideoObject,
    avatarVideoProviderPredictionId: generatedVideo.predictionId,
    providerModels: [generatedVideo.modelId],
  };
}
