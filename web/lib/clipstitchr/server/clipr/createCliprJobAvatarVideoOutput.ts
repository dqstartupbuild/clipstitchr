import { api } from "@/convex/_generated/api";
import { createCliprSyncedAvatarVideoOutput } from "@/lib/clipstitchr/server/createCliprSyncedAvatarVideoOutput";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import type { CliprJobAvatarImageOutput } from "@/lib/clipstitchr/server/clipr/createCliprJobAvatarImageOutput";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";
import type { CliprJobInputDocuments } from "@/lib/clipstitchr/server/clipr/CliprJobInputDocuments";
import type { CliprJobServerContext } from "@/lib/clipstitchr/server/clipr/CliprJobServerContext";
import type { CliprTextGeneration } from "@/lib/clipstitchr/types/CliprTextGeneration";
import { createCliprMusicMetadataFromSharedTrack } from "@/lib/clipstitchr/utils/createCliprMusicMetadataFromSharedTrack";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprJobAvatarVideoOutputOptions = CliprJobServerContext & {
  avatarImageOutput: CliprJobAvatarImageOutput;
  documents: CliprJobInputDocuments;
  input: CliprJobCreateInput;
  replicate: ReplicateClient;
  textGeneration: CliprTextGeneration;
  userId: string;
};

export async function createCliprJobAvatarVideoOutput({
  avatarImageOutput,
  convex,
  documents,
  input,
  replicate,
  secret,
  textGeneration,
  userId,
}: CreateCliprJobAvatarVideoOutputOptions) {
  const avatarVideoOutput = await createCliprSyncedAvatarVideoOutput({
    imageUrl: avatarImageOutput.generatedAvatarImage.outputUrl,
    jobId: input.jobId,
    lipSyncModelId: input.lipSyncModelId,
    replicate,
    script: textGeneration.script,
    targetDurationSeconds: input.durationSeconds,
    ttsModelId: input.ttsModelId,
    userId,
    voiceId: input.voiceId,
  });

  const selectedMusic = documents.selectedMusicTrack
    ? createCliprMusicMetadataFromSharedTrack(documents.selectedMusicTrack)
    : null;

  return await convex.mutation(api.cliprJobs.recordAvatarVideoOutput, {
    secret,
    id: input.jobId,
    avatarVideoObject: avatarVideoOutput.avatarVideoObject,
    avatarVideoProviderPredictionId:
      avatarVideoOutput.avatarVideoProviderPredictionId,
    music: selectedMusic ?? undefined,
    providerModels: avatarVideoOutput.providerModels,
    progress: 0.68,
    updatedAt: new Date().toISOString(),
  });
}
