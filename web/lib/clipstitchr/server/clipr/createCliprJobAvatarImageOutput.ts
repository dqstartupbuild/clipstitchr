import { api } from "@/convex/_generated/api";
import { createCliprSceneAvatarImage } from "@/lib/clipstitchr/server/createCliprSceneAvatarImage";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getCliprAvatarSourceScene } from "@/lib/clipstitchr/server/getCliprAvatarSourceScene";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { saveCliprGeneratedAvatarPhoto } from "@/lib/clipstitchr/server/saveCliprGeneratedAvatarPhoto";
import { saveCliprSceneImageObject } from "@/lib/clipstitchr/server/saveCliprSceneImageObject";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";
import type { CliprJobInputDocuments } from "@/lib/clipstitchr/server/clipr/CliprJobInputDocuments";
import type { CliprJobServerContext } from "@/lib/clipstitchr/server/clipr/CliprJobServerContext";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";
import type { CliprTextGeneration } from "@/lib/clipstitchr/types/CliprTextGeneration";
import { createId } from "@/lib/clipstitchr/utils/createId";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CliprGeneratedAvatarImage = Awaited<
  ReturnType<typeof createCliprSceneAvatarImage>
>;

type CreateCliprJobAvatarImageOutputOptions = CliprJobServerContext & {
  documents: CliprJobInputDocuments;
  input: CliprJobCreateInput;
  replicate: ReplicateClient;
  textGeneration: CliprTextGeneration;
  userId: string;
};

export type CliprJobAvatarImageOutput = {
  avatarSourceScene: CliprScenePlan;
  generatedAvatarImage: CliprGeneratedAvatarImage;
};

export async function createCliprJobAvatarImageOutput({
  convex,
  documents,
  input,
  replicate,
  secret,
  textGeneration,
  userId,
}: CreateCliprJobAvatarImageOutputOptions): Promise<CliprJobAvatarImageOutput> {
  if (!documents.avatar || !documents.avatarPhoto) {
    throw new Error("Clipr avatar and source photo are required.");
  }

  const referenceImageUrl = (
    await getR2DownloadSignedUrl(documents.avatarPhoto.photoObject.key)
  ).url;
  const avatarSourceScene = getCliprAvatarSourceScene(
    textGeneration.scenePlan,
    textGeneration.script,
  );

  await convex.mutation(api.rateLimits.consumeCliprVoiceGeneration, {
    estimatedSeconds: input.durationSeconds,
    secret,
  });

  await convex.mutation(api.rateLimits.consumeCliprAvatarStillGeneration, {
    secret,
  });

  const generatedAvatarImage = await createCliprSceneAvatarImage({
    avatarDescription: documents.avatar.description,
    quality: "auto",
    referenceImageUrl,
    replicate,
    scene: avatarSourceScene,
  });
  const generatedAvatarPhotoId = createId();

  await convex.mutation(api.rateLimits.consumeR2Upload, {
    secret,
    sizeBytes: generatedAvatarImage.body.byteLength * 2,
  });

  const [avatarImageObject] = await Promise.all([
    saveCliprSceneImageObject({
      body: generatedAvatarImage.body,
      contentType: generatedAvatarImage.contentType,
      jobId: input.jobId,
      sceneId: "avatar-source",
      userId,
    }),
    saveCliprGeneratedAvatarPhoto({
      avatarDescription: documents.avatar.description,
      avatarId: documents.avatar.id,
      avatarName: documents.avatar.name,
      body: generatedAvatarImage.body,
      contentType: generatedAvatarImage.contentType,
      convex,
      createdAt: new Date().toISOString(),
      photoId: generatedAvatarPhotoId,
      productId: documents.product.id,
      scene: avatarSourceScene,
      userId,
    }),
  ]);

  await convex.mutation(api.cliprJobs.recordAvatarImageOutput, {
    secret,
    id: input.jobId,
    avatarImageObject,
    avatarImageProviderPredictionId: generatedAvatarImage.predictionId,
    providerModels: [generatedAvatarImage.modelId],
    progress: 0.45,
    updatedAt: new Date().toISOString(),
  });

  return {
    avatarSourceScene,
    generatedAvatarImage,
  };
}
