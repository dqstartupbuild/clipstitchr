import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createCliprAvatarVideo } from "@/lib/clipstitchr/server/createCliprAvatarVideo";
import { createCliprMusic } from "@/lib/clipstitchr/server/createCliprMusic";
import { createCliprSceneAvatarImage } from "@/lib/clipstitchr/server/createCliprSceneAvatarImage";
import { createCliprTextGeneration } from "@/lib/clipstitchr/server/createCliprTextGeneration";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getCliprAvatarSourceScene } from "@/lib/clipstitchr/server/getCliprAvatarSourceScene";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { saveCliprAvatarVideoObject } from "@/lib/clipstitchr/server/saveCliprAvatarVideoObject";
import { saveCliprMusicObject } from "@/lib/clipstitchr/server/saveCliprMusicObject";
import { saveCliprSceneImageObject } from "@/lib/clipstitchr/server/saveCliprSceneImageObject";
import { saveSharedMusicObject } from "@/lib/clipstitchr/server/saveSharedMusicObject";
import { cliprMusicGenerationDefaults } from "@/lib/clipstitchr/constants/cliprMusicGenerationDefaults";
import { createCliprMusicMetadataFromSharedTrack } from "@/lib/clipstitchr/utils/createCliprMusicMetadataFromSharedTrack";
import { getCliprDurationSeconds } from "@/lib/clipstitchr/utils/getCliprDurationSeconds";
import { getCliprVoiceId } from "@/lib/clipstitchr/utils/getCliprVoiceId";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getGeneratedMusicTrackTags } from "@/lib/clipstitchr/utils/getGeneratedMusicTrackTags";
import { getGeneratedMusicTrackTitle } from "@/lib/clipstitchr/utils/getGeneratedMusicTrackTitle";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";

export const runtime = "nodejs";

type CliprJobCreateRequest = {
  addMusic?: unknown;
  avatarId?: unknown;
  durationSeconds?: unknown;
  jobId?: unknown;
  musicTrackId?: unknown;
  productId?: unknown;
  voiceId?: unknown;
};

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  const convexToken = await getAuthenticatedConvexToken();

  if (!convexToken) {
    return NextResponse.json(
      { message: "Unable to create a Convex auth token." },
      { status: 500 },
    );
  }

  const convex = createAuthenticatedConvexHttpClient(convexToken);
  const secret = getRateLimitApiSecret();
  const body = (await request.json()) as CliprJobCreateRequest;
  const productId =
    typeof body.productId === "string" ? body.productId.trim() : "";
  const avatarId =
    typeof body.avatarId === "string" ? body.avatarId.trim() : "";
  const durationSeconds = getCliprDurationSeconds(body.durationSeconds);
  const voiceId = getCliprVoiceId(body.voiceId);
  const musicTrackId =
    typeof body.musicTrackId === "string" ? body.musicTrackId.trim() : "";
  const addMusic = body.addMusic === true && !musicTrackId;
  const requestedJobId =
    typeof body.jobId === "string" ? body.jobId.trim() : "";
  const jobId = requestedJobId ? requestedJobId.slice(0, 128) : createId();

  try {
    if (!productId) {
      throw new Error("Choose a saved product first.");
    }

    if (!avatarId) {
      throw new Error("Choose an avatar first.");
    }

    await convex.mutation(api.rateLimits.consumeCliprJobCreate, {
      estimatedSeconds: durationSeconds,
      secret,
    });
    await convex.mutation(api.rateLimits.consumeCliprHookScript, { secret });

    const [productDocument, avatarDocument, avatarPhotoDocument] =
      await Promise.all([
        convex.query(api.products.get, { id: productId }),
        convex.query(api.avatars.get, { id: avatarId }),
        convex.query(api.photoAssets.getFirstForAvatar, { avatarId }),
      ]);
    const selectedMusicTrack = musicTrackId
      ? await convex.query(api.sharedMusicTracks.get, { id: musicTrackId })
      : null;

    if (!productDocument) {
      throw new Error("Saved product not found.");
    }

    if (!avatarDocument) {
      throw new Error("Avatar not found.");
    }

    if (!avatarPhotoDocument) {
      throw new Error("Upload at least one photo for this avatar.");
    }

    if (musicTrackId && !selectedMusicTrack) {
      throw new Error("Selected music track was not found.");
    }

    const now = new Date().toISOString();
    const product = createProductProfileFromConvexDocument(productDocument);

    await convex.mutation(api.cliprJobs.createQueued, {
      secret,
      id: jobId,
      productId: product.id,
      productName: product.name,
      productDetails: product.productDetails,
      audienceDetails: product.audienceDetails,
      productInferredProblem: product.inferredProblem,
      productInferredPainPoints: product.inferredPainPoints,
      avatarId: avatarDocument.id,
      avatarName: avatarDocument.name,
      avatarPhotoId: avatarPhotoDocument.id,
      voiceId,
      targetDurationSeconds: durationSeconds,
      createdAt: now,
    });

    const replicate = createReplicateClient();
    const textGeneration = await createCliprTextGeneration({
      durationSeconds,
      product,
      purpose: "clipr",
      replicate,
      slideCount: 4,
    });

    await convex.mutation(api.cliprJobs.applyScriptPlan, {
      secret,
      id: jobId,
      hookStyleKey: textGeneration.hookStyleKey,
      hookTemplateId: textGeneration.hookTemplateId,
      filledHook: textGeneration.filledHook,
      variablesUsed: textGeneration.variablesUsed,
      script: textGeneration.script,
      scenePlan: textGeneration.scenePlan,
      providerModel: textGeneration.providerModel,
      updatedAt: new Date().toISOString(),
    });

    const referenceImageUrl = (
      await getR2DownloadSignedUrl(avatarPhotoDocument.photoObject.key)
    ).url;
    const avatarSourceScene = getCliprAvatarSourceScene(
      textGeneration.scenePlan,
      textGeneration.script,
    );

    await convex.mutation(api.rateLimits.consumeCliprVoiceGeneration, {
      estimatedSeconds: durationSeconds,
      secret,
    });

    if (addMusic) {
      await convex.mutation(api.rateLimits.consumeCliprMusicGeneration, {
        generatedSeconds: cliprMusicGenerationDefaults.durationSeconds,
        secret,
      });
    }

    await convex.mutation(api.rateLimits.consumeCliprAvatarStillGeneration, {
      secret,
    });

    const generatedAvatarImage = await createCliprSceneAvatarImage({
      avatarDescription: avatarDocument.description,
      referenceImageUrl,
      replicate,
      scene: avatarSourceScene,
    });
    const avatarImageObject = await saveCliprSceneImageObject({
      body: generatedAvatarImage.body,
      contentType: generatedAvatarImage.contentType,
      jobId,
      sceneId: "avatar-source",
      userId,
    });

    await convex.mutation(api.cliprJobs.recordAvatarImageOutput, {
      secret,
      id: jobId,
      avatarImageObject,
      avatarImageProviderPredictionId: generatedAvatarImage.predictionId,
      providerModels: [generatedAvatarImage.modelId],
      progress: 0.45,
      updatedAt: new Date().toISOString(),
    });

    const [generatedAvatarVideo, generatedMusic] = await Promise.all([
      createCliprAvatarVideo({
        imageUrl: generatedAvatarImage.outputUrl,
        replicate,
        script: textGeneration.script,
        voiceId,
      }),
      addMusic
        ? createCliprMusic({
            audienceDetails: product.audienceDetails,
            productName: product.name,
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
          jobId,
          userId,
        }),
        generatedMusic
          ? saveCliprMusicObject({
              body: generatedMusic.body,
              contentType: generatedMusic.contentType,
              jobId: `${jobId}-${generatedMusicTrackId}`,
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
    const generatedMusicTitle = generatedMusic
      ? getGeneratedMusicTrackTitle({
          source: "clipr",
          style: product.name,
          trackId: generatedMusicTrackId,
        })
      : "";
    const generatedMusicTags = generatedMusic
      ? getGeneratedMusicTrackTags({
          includeStyleTags: false,
          source: "clipr",
          style: product.name,
        })
      : [];

    if (generatedMusic && musicObject && sharedMusicObject) {
      await convex.mutation(api.sharedMusicTracks.save, {
        id: generatedMusicTrackId,
        title: generatedMusicTitle,
        tags: generatedMusicTags,
        style: product.name,
        durationSeconds: generatedMusic.durationSeconds,
        audioObject: sharedMusicObject,
        ownerAudioObject: musicObject,
        mimeType: generatedMusic.contentType,
        size: generatedMusic.body.byteLength,
        prompt: generatedMusic.prompt,
        providerModel: generatedMusic.modelId,
        providerPredictionId: generatedMusic.predictionId,
        source: "clipr",
        createdAt: musicRecordedAt,
      });
    }

    const selectedMusic = selectedMusicTrack
      ? createCliprMusicMetadataFromSharedTrack(selectedMusicTrack)
      : null;
    const musicMetadata =
      selectedMusic ??
      (generatedMusic && musicObject
        ? {
            audioObject: musicObject,
            createdAt: musicRecordedAt,
            durationSeconds: generatedMusic.durationSeconds,
            enabled: true,
            prompt: generatedMusic.prompt,
            providerModel: generatedMusic.modelId,
            providerPredictionId: generatedMusic.predictionId,
            sharedTrackId: generatedMusicTrackId,
            tags: generatedMusicTags,
            title: generatedMusicTitle,
            updatedAt: musicRecordedAt,
            volume: 1,
          }
        : undefined);

    const job = await convex.mutation(api.cliprJobs.recordAvatarVideoOutput, {
      secret,
      id: jobId,
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

    await capturePostHogServerEvent({
      distinctId: userId,
      event: "clipr_job_created",
      properties: {
        job_id: jobId,
        product_id: productId,
        avatar_id: avatarId,
        duration_seconds: durationSeconds,
        voice_id: voiceId,
        has_music: Boolean(musicMetadata),
      },
      request,
    });

    return NextResponse.json({ job });
  } catch (error) {
    await convex
      .mutation(api.cliprJobs.fail, {
        secret,
        id: jobId,
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate this Clipr clip.",
        updatedAt: new Date().toISOString(),
      })
      .catch(() => null);

    await capturePostHogServerEvent({
      distinctId: userId,
      event: "clipr_job_failed",
      properties: {
        job_id: jobId,
        product_id: productId,
        avatar_id: avatarId,
        error_name: error instanceof Error ? error.name : "UnknownError",
      },
      request,
    });

    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to generate this Clipr clip.",
      },
      { status: 500 },
    );
  }
}
