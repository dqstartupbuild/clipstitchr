import { api } from "@/convex/_generated/api";
import { createCliprAvatarVideo } from "@/lib/clipstitchr/server/createCliprAvatarVideo";
import { createCliprMusic } from "@/lib/clipstitchr/server/createCliprMusic";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { saveCliprAvatarVideoObject } from "@/lib/clipstitchr/server/saveCliprAvatarVideoObject";
import { saveCliprMusicObject } from "@/lib/clipstitchr/server/saveCliprMusicObject";
import { saveSharedMusicObject } from "@/lib/clipstitchr/server/saveSharedMusicObject";
import { createCliprGeneratedMusicMetadata } from "@/lib/clipstitchr/server/clipr/createCliprGeneratedMusicMetadata";
import { saveCliprGeneratedMusicTrack } from "@/lib/clipstitchr/server/clipr/saveCliprGeneratedMusicTrack";
import type { CliprJobAvatarImageOutput } from "@/lib/clipstitchr/server/clipr/createCliprJobAvatarImageOutput";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";
import type { CliprJobInputDocuments } from "@/lib/clipstitchr/server/clipr/CliprJobInputDocuments";
import type { CliprJobServerContext } from "@/lib/clipstitchr/server/clipr/CliprJobServerContext";
import type { CliprTextGeneration } from "@/lib/clipstitchr/types/CliprTextGeneration";
import { createCliprMusicMetadataFromSharedTrack } from "@/lib/clipstitchr/utils/createCliprMusicMetadataFromSharedTrack";
import { createId } from "@/lib/clipstitchr/utils/createId";

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
  const [generatedAvatarVideo, generatedMusic] = await Promise.all([
    createCliprAvatarVideo({
      imageUrl: avatarImageOutput.generatedAvatarImage.outputUrl,
      replicate,
      script: textGeneration.script,
      voiceId: input.voiceId,
    }),
    input.addMusic
      ? createCliprMusic({
          audienceDetails: documents.product.audienceDetails,
          productName: documents.product.name,
          replicate,
          script: textGeneration.script,
        })
      : Promise.resolve(null),
  ]);

  if (generatedMusic) {
    await convex.mutation(api.rateLimits.consumeR2Upload, {
      secret,
      sizeBytes: generatedMusic.body.byteLength * 2,
    });
  }

  const generatedMusicTrackId = generatedMusic ? createId() : "";
  const [avatarVideoObject, musicObject, sharedMusicObject] =
    await Promise.all([
      saveCliprAvatarVideoObject({
        body: generatedAvatarVideo.body,
        contentType: generatedAvatarVideo.contentType,
        jobId: input.jobId,
        userId,
      }),
      generatedMusic
        ? saveCliprMusicObject({
            body: generatedMusic.body,
            contentType: generatedMusic.contentType,
            jobId: `${input.jobId}-${generatedMusicTrackId}`,
            userId,
          })
        : Promise.resolve(null),
      generatedMusic
        ? saveSharedMusicObject({
            body: generatedMusic.body,
            contentType: generatedMusic.contentType,
            trackId: generatedMusicTrackId,
          })
        : Promise.resolve(null),
    ]);
  const musicRecordedAt = new Date().toISOString();
  const generatedMusicMetadata =
    generatedMusic && musicObject
      ? createCliprGeneratedMusicMetadata({
          generatedMusic,
          generatedMusicTrackId,
          musicObject,
          productName: documents.product.name,
          recordedAt: musicRecordedAt,
        })
      : undefined;

  if (
    generatedMusic &&
    generatedMusicMetadata &&
    musicObject &&
    sharedMusicObject
  ) {
    await saveCliprGeneratedMusicTrack({
      convex,
      generatedMusic,
      metadata: generatedMusicMetadata,
      musicObject,
      productName: documents.product.name,
      recordedAt: musicRecordedAt,
      sharedMusicObject,
      trackId: generatedMusicTrackId,
    });
  }

  const selectedMusic = documents.selectedMusicTrack
    ? createCliprMusicMetadataFromSharedTrack(documents.selectedMusicTrack)
    : null;
  const musicMetadata = selectedMusic ?? generatedMusicMetadata;

  return await convex.mutation(api.cliprJobs.recordAvatarVideoOutput, {
    secret,
    id: input.jobId,
    avatarVideoObject,
    avatarVideoProviderPredictionId: generatedAvatarVideo.predictionId,
    music: musicMetadata,
    providerModels: [
      generatedAvatarVideo.modelId,
      ...(generatedMusic ? [generatedMusic.modelId] : []),
    ],
    progress: 0.68,
    updatedAt: new Date().toISOString(),
  });
}
