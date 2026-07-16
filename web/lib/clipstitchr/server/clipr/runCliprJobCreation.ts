import { api } from "@/convex/_generated/api";
import { assertCliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/assertCliprJobCreateInput";
import { consumeCliprJobStartRateLimits } from "@/lib/clipstitchr/server/clipr/consumeCliprJobStartRateLimits";
import { createQueuedCliprJobRecord } from "@/lib/clipstitchr/server/clipr/createQueuedCliprJobRecord";
import { loadCliprJobInputDocuments } from "@/lib/clipstitchr/server/clipr/loadCliprJobInputDocuments";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";
import type { CliprJobServerContext } from "@/lib/clipstitchr/server/clipr/CliprJobServerContext";

type RunCliprJobCreationOptions = CliprJobServerContext & {
  input: CliprJobCreateInput;
  userId: string;
};

export async function runCliprJobCreation({
  convex,
  input,
  secret,
  userId,
}: RunCliprJobCreationOptions) {
  assertCliprJobCreateInput(input);

  await consumeCliprJobStartRateLimits({ convex, input, secret });

  const documents = await loadCliprJobInputDocuments({ convex, input });
  const createdAt = new Date().toISOString();

  await Promise.all([
    convex.mutation(api.rateLimits.consumeCliprVideoGeneration, {
      estimatedSeconds: input.durationSeconds,
      secret,
    }),
    input.generationMode === "script"
      ? convex.mutation(api.rateLimits.consumeCliprVoiceGeneration, {
          estimatedSeconds: input.durationSeconds,
          secret,
        })
      : Promise.resolve(null),
    input.generationMode === "demo"
      ? Promise.resolve(null)
      : convex.mutation(api.rateLimits.consumeCliprAvatarStillGeneration, {
          secret,
        }),
  ]);

  const providerJobId = `provider:clipr:${input.jobId}`;
  const reservation = await convex.mutation(
    api.usage.reserveAiVideo.reserveAiVideo,
    {
      domainId: input.jobId,
      domainKind: "clipr_job",
      idempotencyKey: `clipr-video:${userId}:${input.jobId}`,
      now: createdAt,
      operation: "clipr_video",
    },
  );

  try {
    const job = await createQueuedCliprJobRecord({
      convex,
      createdAt,
      documents,
      input,
      secret,
      usageReservationId: reservation.reservationId,
    });

    await convex.mutation(api.providerJobs.create, {
      secret,
      ownerId: userId,
      id: providerJobId,
      jobType: "manual-clipr",
      stage: "awaiting-script-provider",
      idempotencyKey: `${userId}:manual-clipr:${input.jobId}`,
      inputSnapshotJson: JSON.stringify({
        avatarDescription: documents.avatar?.description,
        avatarId: documents.avatar?.id ?? "",
        avatarName: documents.avatar?.name ?? "",
        avatarPhotoId: documents.avatarPhoto?.id ?? "",
        avatarPhotoObject: documents.avatarPhoto?.photoObject,
        avatarSceneLocation: input.avatarSceneLocation,
        avatarSceneOutfit: input.avatarSceneOutfit,
        avatarScenePose: input.avatarScenePose,
        audienceDetails: documents.product.audienceDetails,
        demoClipId: documents.demoClip?.id,
        demoClipName: documents.demoClip?.name,
        demoVideoDescription: documents.demoClip?.videoDescription,
        demoVideoObject: documents.demoClip?.videoObject,
        durationSeconds: input.durationSeconds,
        generationMode: input.generationMode,
        inferredPainPoints: documents.product.inferredPainPoints,
        inferredProblem: documents.product.inferredProblem,
        jobId: input.jobId,
        lipSyncModelId: input.lipSyncModelId,
        musicTrack: documents.selectedMusicTrack,
        productDetails: documents.product.productDetails,
        productId: documents.product.id,
        productName: documents.product.name,
        requestedGenerationMode: input.requestedGenerationMode,
        requestedVideoModelId: input.requestedVideoModelId,
        scriptIdea: input.scriptIdea,
        ttsModelId: input.ttsModelId,
        videoModelId: input.videoModelId,
        voiceId: input.voiceId,
      }),
      usageReservationId: reservation.reservationId,
      createdAt,
    });

    return job;
  } catch (error) {
    await convex.mutation(
      api.usage.cancelUsageReservation.cancelUsageReservation,
      {
        now: new Date().toISOString(),
        reason: "Clipr job could not be queued",
        reservationId: reservation.reservationId,
      },
    );
    throw error;
  }
}
