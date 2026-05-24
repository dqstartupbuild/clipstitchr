import { api } from "@/convex/_generated/api";
import { cliprMusicGenerationDefaults } from "@/lib/clipstitchr/constants/cliprMusicGenerationDefaults";
import { createCliprAvatarVideo } from "@/lib/clipstitchr/server/createCliprAvatarVideo";
import { createCliprGeneratedVideo } from "@/lib/clipstitchr/server/createCliprGeneratedVideo";
import { createCliprGeneratedVideoPrompt } from "@/lib/clipstitchr/server/createCliprGeneratedVideoPrompt";
import { createCliprMusic } from "@/lib/clipstitchr/server/createCliprMusic";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createCliprGeneratedMusicMetadata } from "@/lib/clipstitchr/server/clipr/createCliprGeneratedMusicMetadata";
import { saveCliprGeneratedMusicTrack } from "@/lib/clipstitchr/server/clipr/saveCliprGeneratedMusicTrack";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { saveCliprAvatarVideoObject } from "@/lib/clipstitchr/server/saveCliprAvatarVideoObject";
import { saveCliprMusicObject } from "@/lib/clipstitchr/server/saveCliprMusicObject";
import { saveCliprSceneVideoObject } from "@/lib/clipstitchr/server/saveCliprSceneVideoObject";
import { saveSharedMusicObject } from "@/lib/clipstitchr/server/saveSharedMusicObject";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";
import type { CliprJobInputDocuments } from "@/lib/clipstitchr/server/clipr/CliprJobInputDocuments";
import type { CliprJobServerContext } from "@/lib/clipstitchr/server/clipr/CliprJobServerContext";
import type { CliprTextGeneration } from "@/lib/clipstitchr/types/CliprTextGeneration";
import { createCliprMusicMetadataFromSharedTrack } from "@/lib/clipstitchr/utils/createCliprMusicMetadataFromSharedTrack";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getCliprContentTypeUsesVoiceover } from "@/lib/clipstitchr/utils/getCliprContentTypeUsesVoiceover";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprJobGeneratedVideoOutputOptions = CliprJobServerContext & {
  documents: CliprJobInputDocuments;
  input: CliprJobCreateInput;
  replicate: ReplicateClient;
  textGeneration: CliprTextGeneration;
  userId: string;
};

export async function createCliprJobGeneratedVideoOutput({
  convex,
  documents,
  input,
  replicate,
  secret,
  textGeneration,
  userId,
}: CreateCliprJobGeneratedVideoOutputOptions) {
  const referenceImageUrl =
    input.contentType === "b-roll-reel" ||
    getCliprContentTypeUsesVoiceover(input.contentType)
      ? (await getR2DownloadSignedUrl(documents.avatarPhoto.photoObject.key)).url
      : undefined;
  const estimatedVideoSeconds = textGeneration.scenePlan.reduce(
    (total, scene) => total + scene.estimatedDurationSeconds,
    0,
  );

  await convex.mutation(api.rateLimits.consumeCliprGeneratedVideoGeneration, {
    estimatedSeconds: estimatedVideoSeconds,
    secret,
  });

  if (getCliprContentTypeUsesVoiceover(input.contentType)) {
    await convex.mutation(api.rateLimits.consumeCliprVoiceGeneration, {
      estimatedSeconds: input.durationSeconds,
      secret,
    });
  }

  if (input.addMusic) {
    await convex.mutation(api.rateLimits.consumeCliprMusicGeneration, {
      generatedSeconds: cliprMusicGenerationDefaults.durationSeconds,
      secret,
    });
  }

  const [generatedVideos, voiceSourceVideo, generatedMusic] = await Promise.all([
    Promise.all(
      textGeneration.scenePlan.map((scene) =>
        createCliprGeneratedVideo({
          durationSeconds: scene.estimatedDurationSeconds,
          imageUrl:
            input.contentType === "b-roll-reel" ? referenceImageUrl : undefined,
          prompt: createCliprGeneratedVideoPrompt({
            audienceDetails: documents.product.audienceDetails,
            contentType: input.contentType,
            filledHook: textGeneration.filledHook,
            productDetails: documents.product.productDetails,
            productName: documents.product.name,
            scenePrompt: scene.visualPrompt,
          }),
          replicate,
        }),
      ),
    ),
    getCliprContentTypeUsesVoiceover(input.contentType) && referenceImageUrl
      ? createCliprAvatarVideo({
          imageUrl: referenceImageUrl,
          replicate,
          script: textGeneration.script,
          voiceId: input.voiceId,
        })
      : Promise.resolve(null),
    input.addMusic
      ? createCliprMusic({
          audienceDetails: documents.product.audienceDetails,
          productName: documents.product.name,
          replicate,
          script: textGeneration.script,
        })
      : Promise.resolve(null),
  ]);
  const uploadSize =
    generatedVideos.reduce((total, video) => total + video.body.byteLength, 0) +
    (voiceSourceVideo?.body.byteLength ?? 0) +
    (generatedMusic ? generatedMusic.body.byteLength * 2 : 0);

  await convex.mutation(api.rateLimits.consumeR2Upload, {
    secret,
    sizeBytes: uploadSize,
  });

  const generatedMusicTrackId = generatedMusic ? createId() : "";
  const [sceneVideoObjects, voiceSourceVideoObject, musicObject, sharedMusicObject] =
    await Promise.all([
      Promise.all(
        generatedVideos.map((video, index) =>
          saveCliprSceneVideoObject({
            body: video.body,
            contentType: video.contentType,
            jobId: input.jobId,
            sceneId: textGeneration.scenePlan[index]?.id ?? `scene-${index}`,
            userId,
          }),
        ),
      ),
      voiceSourceVideo
        ? saveCliprAvatarVideoObject({
            body: voiceSourceVideo.body,
            contentType: voiceSourceVideo.contentType,
            jobId: `${input.jobId}-voiceover`,
            userId,
          })
        : Promise.resolve(null),
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
  const scenePlan = textGeneration.scenePlan.map((scene, index) => ({
    ...scene,
    generatedVideoObject: sceneVideoObjects[index],
    providerPredictionId: generatedVideos[index]?.predictionId,
  }));

  return await convex.mutation(api.cliprJobs.recordGeneratedVideoOutput, {
    secret,
    id: input.jobId,
    avatarVideoObject: voiceSourceVideoObject ?? undefined,
    avatarVideoProviderPredictionId: voiceSourceVideo?.predictionId,
    music: musicMetadata,
    scenePlan,
    providerModels: [
      ...generatedVideos.map((video) => video.modelId),
      ...(voiceSourceVideo ? [voiceSourceVideo.modelId] : []),
      ...(generatedMusic ? [generatedMusic.modelId] : []),
    ],
    progress: 0.68,
    updatedAt: new Date().toISOString(),
  });
}
