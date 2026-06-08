import { api } from "@/convex/_generated/api";
import { cliprMusicGenerationDefaults } from "@/lib/clipstitchr/constants/cliprMusicGenerationDefaults";
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
    convex.mutation(api.rateLimits.consumeCliprVoiceGeneration, {
      estimatedSeconds: input.durationSeconds,
      secret,
    }),
    convex.mutation(api.rateLimits.consumeCliprAvatarStillGeneration, {
      secret,
    }),
    input.addMusic
      ? convex.mutation(api.rateLimits.consumeCliprMusicGeneration, {
          generatedSeconds: cliprMusicGenerationDefaults.durationSeconds,
          secret,
        })
      : Promise.resolve(null),
  ]);

  const job = await createQueuedCliprJobRecord({
    convex,
    createdAt,
    documents,
    input,
    secret,
  });

  await convex.mutation(api.providerJobs.create, {
    secret,
    ownerId: userId,
    id: `provider:clipr:${input.jobId}`,
    jobType: "manual-clipr",
    stage: "awaiting-script-provider",
    idempotencyKey: `${userId}:manual-clipr:${input.jobId}`,
    inputSnapshotJson: JSON.stringify({
      addMusic: input.addMusic,
      avatarDescription: documents.avatar.description,
      avatarId: documents.avatar.id,
      avatarName: documents.avatar.name,
      avatarPhotoId: documents.avatarPhoto.id,
      avatarPhotoObject: documents.avatarPhoto.photoObject,
      audienceDetails: documents.product.audienceDetails,
      durationSeconds: input.durationSeconds,
      inferredPainPoints: documents.product.inferredPainPoints,
      inferredProblem: documents.product.inferredProblem,
      jobId: input.jobId,
      musicTrack: documents.selectedMusicTrack,
      productDetails: documents.product.productDetails,
      productId: documents.product.id,
      productName: documents.product.name,
      scriptIdea: input.scriptIdea,
      voiceId: input.voiceId,
    }),
    createdAt,
  });

  return job;
}
