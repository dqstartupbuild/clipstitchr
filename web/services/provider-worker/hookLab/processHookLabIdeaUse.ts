import type { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { createCliprSceneAvatarImage } from "@/lib/clipstitchr/server/createCliprSceneAvatarImage";
import { createCliprVisualAvatarVideoOutput } from "@/lib/clipstitchr/server/createCliprVisualAvatarVideoOutput";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { saveCliprSceneImageObject } from "@/lib/clipstitchr/server/saveCliprSceneImageObject";
import type { HookLabCreativeBeat } from "@/lib/clipstitchr/types/HookLabCreativeBeat";
import type { HookLabStitchRecipe } from "@/lib/clipstitchr/types/HookLabStitchRecipe";
import type { HookLabTextBlueprint } from "@/lib/clipstitchr/types/HookLabTextBlueprint";
import type { HookLabTextDecision } from "@/lib/clipstitchr/types/HookLabTextDecision";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { getHookLabVariationDirection } from "@/lib/clipstitchr/utils/getHookLabVariationDirection";
import { createHookLabTextOverlay } from "./createHookLabTextOverlay";
import { createHookLabUseGeneration } from "./createHookLabUseGeneration";
import { getHookLabVisualVideoModelId } from "./getHookLabVisualVideoModelId";
import { parseHookLabIdeaUseJobInput } from "./parseHookLabIdeaUseJobInput";
import { reserveHookLabVariantHook } from "./reserveHookLabVariantHook";
import { resolveHookLabSiblingReservationConflict } from "./resolveHookLabSiblingReservationConflict";

const api = anyApi;
const HOOK_LAB_OPENING_DURATION_SECONDS = 8;

type HookLabUseJob = {
  id: string;
  inputSnapshotJson: string;
  ownerId: string;
};

type HookLabUseProviderInput = {
  avatar: {
    description?: string;
    id: string;
    name: string;
  };
  avatarPhoto: {
    locationDescription?: string;
    outfitDescription?: string;
    photoObject: R2ObjectReference;
    poseDescription?: string;
  };
  demoClip: {
    defaultTrimRange?: { end: number; start: number };
    duration: number;
    hasAudio: boolean;
    id: string;
    name: string;
    videoObject: R2ObjectReference;
  };
  idea: {
    creativeBeat?: HookLabCreativeBeat;
    id: string;
    name: string;
    stitchRecipe?: HookLabStitchRecipe;
    textBlueprint?: HookLabTextBlueprint;
  };
  product: {
    audienceDetails: string;
    id: string;
    name: string;
    productDetails: string;
    rejectedHookExamples?: string[];
  };
  siblingHooks: string[];
  use: {
    id: string;
  };
  variant: {
    generatedCaption?: string;
    generatedHook?: string;
    generatedImageObject?: R2ObjectReference;
    generatedVideoObject?: R2ObjectReference;
    id: string;
    providerPredictionIds: string[];
    textDecision?: HookLabTextDecision;
    textDecisionReason?: string;
    variantIndex: number;
    visualPrompt?: string;
    visualPromptSummary?: string;
  };
};

type ProcessHookLabIdeaUseOptions = {
  client: ConvexHttpClient;
  job: HookLabUseJob;
  providerWorkerSecret: string;
};

export async function processHookLabIdeaUse({
  client,
  job,
  providerWorkerSecret,
}: ProcessHookLabIdeaUseOptions) {
  const { variantId } = parseHookLabIdeaUseJobInput(job.inputSnapshotJson);
  const input = (await client.query(
    api["hookLabIdeaVariants/getInputForProvider"].getInputForProvider,
    {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      id: variantId,
    },
  )) as HookLabUseProviderInput | null;

  if (!input) {
    throw new Error("Hook Lab could not find everything needed for this version.");
  }
  if (!input.idea.textBlueprint || !input.idea.creativeBeat) {
    throw new Error("Hook Lab idea analysis is incomplete.");
  }

  const replicate = createReplicateClient();
  const variationDirection = getHookLabVariationDirection(
    input.variant.variantIndex,
  );
  const checkpointedWriting =
    input.variant.generatedCaption &&
    input.variant.generatedHook &&
    input.variant.textDecision &&
    input.variant.textDecisionReason &&
    input.variant.visualPrompt &&
    input.variant.visualPromptSummary
      ? {
          generatedCaption: input.variant.generatedCaption,
          generatedHook: input.variant.generatedHook,
          modelId: "checkpointed",
          predictionIds: input.variant.providerPredictionIds,
          rewriteCount: 1,
          textDecision: input.variant.textDecision,
          textDecisionReason: input.variant.textDecisionReason,
          visualPrompt: input.variant.visualPrompt,
          visualPromptSummary: input.variant.visualPromptSummary,
        }
      : null;
  let writing =
    checkpointedWriting ??
    (await createHookLabUseGeneration({
      audienceDetails: input.product.audienceDetails,
      avoidPhrases: input.product.rejectedHookExamples ?? [],
      creativeBeat: input.idea.creativeBeat,
      productDetails: input.product.productDetails,
      productName: input.product.name,
      replicate,
      siblingHooks: input.siblingHooks ?? [],
      textBlueprint: input.idea.textBlueprint,
      variationDirection,
    }));
  let hookReservation = checkpointedWriting
    ? {
        accepted: true as const,
        id: input.variant.id,
        siblingHooks: input.siblingHooks,
      }
    : await reserveHookLabVariantHook({
        client,
        generatedCaption: writing.generatedCaption,
        generatedHook: writing.generatedHook,
        ownerId: job.ownerId,
        predictionIds: writing.predictionIds,
        providerWorkerSecret,
        textDecision: writing.textDecision,
        textDecisionReason: writing.textDecisionReason,
        updatedAt: new Date().toISOString(),
        variantId: input.variant.id,
        visualPrompt: writing.visualPrompt,
        visualPromptSummary: writing.visualPromptSummary,
      });

  for (
    let conflictAttempt = 0;
    !hookReservation.accepted && conflictAttempt < 5;
    conflictAttempt += 1
  ) {
    writing = await resolveHookLabSiblingReservationConflict({
      audienceDetails: input.product.audienceDetails,
      productName: input.product.name,
      replicate,
      siblingHooks: hookReservation.siblingHooks,
      sourceText: input.idea.textBlueprint.sourceText,
      textBlueprint: input.idea.textBlueprint,
      variationDirection,
      writing,
    });
    hookReservation = await reserveHookLabVariantHook({
      client,
      generatedCaption: writing.generatedCaption,
      generatedHook: writing.generatedHook,
      ownerId: job.ownerId,
      predictionIds: writing.predictionIds,
      providerWorkerSecret,
      textDecision: writing.textDecision,
      textDecisionReason: writing.textDecisionReason,
      updatedAt: new Date().toISOString(),
      variantId: input.variant.id,
      visualPrompt: writing.visualPrompt,
      visualPromptSummary: writing.visualPromptSummary,
    });
  }

  if (!hookReservation.accepted) {
    throw new Error("Hook Lab could not reserve a distinct batch version.");
  }

  const sceneId = `hook-opening-${input.variant.variantIndex + 1}`;
  const providerPredictionIds = Array.from(
    new Set([
      ...input.variant.providerPredictionIds,
      ...writing.predictionIds,
    ]),
  );
  let generatedImageObject = input.variant.generatedImageObject;

  if (!generatedImageObject) {
    const referenceImageUrl = (
      await getR2DownloadSignedUrl(input.avatarPhoto.photoObject.key)
    ).url;
    const generatedImage = await createCliprSceneAvatarImage({
      avatarDescription: input.avatar.description,
      referenceImageUrl,
      replicate,
      scene: {
        estimatedDurationSeconds: HOOK_LAB_OPENING_DURATION_SECONDS,
        id: sceneId,
        index: input.variant.variantIndex,
        sceneType: "avatar",
        scriptText: "",
        visualPrompt: writing.visualPrompt,
      },
      sceneControls: {
        location: input.avatarPhoto.locationDescription,
        outfit: input.avatarPhoto.outfitDescription,
        pose: input.avatarPhoto.poseDescription,
      },
      generationMode: "reaction",
    });
    generatedImageObject = await saveCliprSceneImageObject({
      body: generatedImage.body,
      contentType: generatedImage.contentType,
      jobId: input.variant.id,
      sceneId,
      userId: job.ownerId,
    });
    providerPredictionIds.push(generatedImage.predictionId);
    await client.mutation(
      api["hookLabIdeaVariants/recordGeneratedImageFromProvider"]
        .recordGeneratedImageFromProvider,
      {
        secret: providerWorkerSecret,
        ownerId: job.ownerId,
        id: input.variant.id,
        imageObject: generatedImageObject,
        predictionId: generatedImage.predictionId,
        updatedAt: new Date().toISOString(),
      },
    );
  }

  let generatedVideoObject = input.variant.generatedVideoObject;

  if (!generatedVideoObject) {
    const generatedImageUrl = (
      await getR2DownloadSignedUrl(generatedImageObject.key)
    ).url;
    const generatedVideo = await createCliprVisualAvatarVideoOutput({
      durationSeconds: HOOK_LAB_OPENING_DURATION_SECONDS,
      imageUrl: generatedImageUrl,
      jobId: input.variant.id,
      modelId: getHookLabVisualVideoModelId(),
      prompt: writing.visualPrompt,
      replicate,
      userId: job.ownerId,
    });
    generatedVideoObject = generatedVideo.avatarVideoObject;
    providerPredictionIds.push(
      generatedVideo.avatarVideoProviderPredictionId,
    );
    await client.mutation(
      api["hookLabIdeaVariants/recordGeneratedVideoFromProvider"]
        .recordGeneratedVideoFromProvider,
      {
        secret: providerWorkerSecret,
        ownerId: job.ownerId,
        id: input.variant.id,
        predictionId: generatedVideo.avatarVideoProviderPredictionId,
        updatedAt: new Date().toISOString(),
        videoObject: generatedVideoObject,
      },
    );
  }
  const updatedAt = new Date().toISOString();

  await client.mutation(
    api["hookLabIdeaVariants/markFinalizingFromProvider"]
      .markFinalizingFromProvider,
    {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      id: input.variant.id,
      providerPredictionIds,
      updatedAt,
    },
  );

  const clipId = `${input.variant.id}:ugc`;
  const stitchId = `${input.variant.id}:stitch`;
  const mediaJobId = `media:hook-lab:${input.variant.id}`;
  const recipe = input.idea.stitchRecipe;
  const demoTrimRange =
    recipe?.demoTrimRange ??
    input.demoClip.defaultTrimRange ?? { start: 0, end: input.demoClip.duration };
  const textOverlay = createHookLabTextOverlay(
    writing.generatedHook,
    HOOK_LAB_OPENING_DURATION_SECONDS,
    recipe?.textOverlay,
  );

  await client.mutation(
    api.mediaJobs.createHookLabVariantFinalizationFromProvider,
    {
      secret: providerWorkerSecret,
      ownerId: job.ownerId,
      id: mediaJobId,
      idempotencyKey: `${input.variant.id}:hook-lab-finalization:v1`,
      inputSnapshotJson: JSON.stringify({
        clipId,
        clipName: `${input.idea.name} · Version ${input.variant.variantIndex + 1}`,
        demoClipId: input.demoClip.id,
        demoClipName: input.demoClip.name,
        demoDuration: input.demoClip.duration,
        demoHasAudio: input.demoClip.hasAudio,
        demoPlaybackRate: recipe?.demoPlaybackRate ?? 1,
        demoQuickEdit: recipe?.demoQuickEdit,
        demoTrimRange,
        generatedCaption: writing.generatedCaption,
        hookLabIdeaId: input.idea.id,
        hookLabIdeaUseId: input.use.id,
        hookLabIdeaVariantId: input.variant.id,
        hookLabIdeaVariantIndex: input.variant.variantIndex,
        includeDemoAudio: recipe?.includeDemoAudio ?? true,
        includeUgcAudio: false,
        mediaJobId,
        mode: recipe?.mode ?? "normal",
        music: recipe?.music,
        productId: input.product.id,
        providerJobId: job.id,
        sourceVideoObject: generatedVideoObject,
        stitchId,
        stitchName: `${input.idea.name} · Version ${input.variant.variantIndex + 1}`,
        textOverlay,
        temporaryObjects: [
          generatedImageObject,
          generatedVideoObject,
        ],
        ugcDuration: HOOK_LAB_OPENING_DURATION_SECONDS,
        ugcPlaybackRate: recipe?.ugcPlaybackRate ?? 1,
        ugcQuickEdit: recipe?.ugcQuickEdit,
        ugcTrimRange: { start: 0, end: HOOK_LAB_OPENING_DURATION_SECONDS },
      }),
      createdAt: updatedAt,
    },
  );
  await client.mutation(api.providerJobs.markProviderStatus, {
    secret: providerWorkerSecret,
    ownerId: job.ownerId,
    id: job.id,
    status: "running",
    stage: "awaiting-media-finalization",
    mediaJobId,
    progress: 0.85,
    releaseLock: true,
    updatedAt,
  });
}
