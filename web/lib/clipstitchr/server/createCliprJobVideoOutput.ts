import { createCliprSyncedAvatarVideoOutput } from "@/lib/clipstitchr/server/createCliprSyncedAvatarVideoOutput";
import { createCliprVisualAvatarVideoOutput } from "@/lib/clipstitchr/server/createCliprVisualAvatarVideoOutput";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprLipSyncModelId } from "@/lib/clipstitchr/types/CliprLipSyncModelId";
import type { CliprResolvedGenerationMode } from "@/lib/clipstitchr/types/CliprResolvedGenerationMode";
import type { CliprTtsModelId } from "@/lib/clipstitchr/types/CliprTtsModelId";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprJobVideoOutputOptions = {
  durationSeconds: CliprDurationSeconds;
  generationMode: CliprResolvedGenerationMode;
  imageUrl: string;
  jobId: string;
  lipSyncModelId: CliprLipSyncModelId;
  prompt: string;
  replicate: ReplicateClient;
  script: string;
  ttsModelId: CliprTtsModelId;
  userId: string;
  videoModelId: Exclude<CliprVideoModelId, "auto">;
  voiceId: string;
};

export async function createCliprJobVideoOutput({
  durationSeconds,
  generationMode,
  imageUrl,
  jobId,
  lipSyncModelId,
  prompt,
  replicate,
  script,
  ttsModelId,
  userId,
  videoModelId,
  voiceId,
}: CreateCliprJobVideoOutputOptions) {
  if (generationMode === "script") {
    return await createCliprSyncedAvatarVideoOutput({
      imageUrl,
      jobId,
      lipSyncModelId,
      replicate,
      script,
      targetDurationSeconds: durationSeconds,
      ttsModelId,
      userId,
      voiceId,
    });
  }

  if (videoModelId === "prunaai/p-video-avatar") {
    throw new Error("Reaction and b-roll clips need a visual video model.");
  }

  return await createCliprVisualAvatarVideoOutput({
    durationSeconds,
    imageUrl,
    jobId,
    modelId: videoModelId,
    prompt,
    replicate,
    userId,
  });
}
