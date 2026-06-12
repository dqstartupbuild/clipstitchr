import { createCliprVisualVideo } from "@/lib/clipstitchr/server/createCliprVisualVideo";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { saveCliprAvatarVideoObject } from "@/lib/clipstitchr/server/saveCliprAvatarVideoObject";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprVisualAvatarVideoOutputOptions = {
  durationSeconds: number;
  imageUrl: string;
  jobId: string;
  modelId: Exclude<CliprVideoModelId, "auto" | "prunaai/p-video-avatar">;
  prompt: string;
  replicate: ReplicateClient;
  userId: string;
};

export async function createCliprVisualAvatarVideoOutput({
  durationSeconds,
  imageUrl,
  jobId,
  modelId,
  prompt,
  replicate,
  userId,
}: CreateCliprVisualAvatarVideoOutputOptions) {
  const generatedVideo = await createCliprVisualVideo({
    durationSeconds,
    imageUrl,
    modelId,
    prompt,
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
