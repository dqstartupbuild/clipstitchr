import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createCliprAvatarVideo } from "@/lib/clipstitchr/server/createCliprAvatarVideo";
import { createCliprSceneAvatarImage } from "@/lib/clipstitchr/server/createCliprSceneAvatarImage";
import { createCliprTextGeneration } from "@/lib/clipstitchr/server/createCliprTextGeneration";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getCliprAvatarSourceScene } from "@/lib/clipstitchr/server/getCliprAvatarSourceScene";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { saveCliprAvatarVideoObject } from "@/lib/clipstitchr/server/saveCliprAvatarVideoObject";
import { saveCliprSceneImageObject } from "@/lib/clipstitchr/server/saveCliprSceneImageObject";
import { getCliprDurationSeconds } from "@/lib/clipstitchr/utils/getCliprDurationSeconds";
import { getCliprVoiceId } from "@/lib/clipstitchr/utils/getCliprVoiceId";
import { createId } from "@/lib/clipstitchr/utils/createId";

export const runtime = "nodejs";

type CliprJobCreateRequest = {
  avatarId?: unknown;
  durationSeconds?: unknown;
  jobId?: unknown;
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

    if (!productDocument) {
      throw new Error("Saved product not found.");
    }

    if (!avatarDocument) {
      throw new Error("Avatar not found.");
    }

    if (!avatarPhotoDocument) {
      throw new Error("Upload at least one photo for this avatar.");
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

    const generatedAvatarVideo = await createCliprAvatarVideo({
      imageUrl: generatedAvatarImage.outputUrl,
      replicate,
      script: textGeneration.script,
      voiceId,
    });
    const avatarVideoObject = await saveCliprAvatarVideoObject({
      body: generatedAvatarVideo.body,
      contentType: generatedAvatarVideo.contentType,
      jobId,
      userId,
    });

    const job = await convex.mutation(api.cliprJobs.recordAvatarVideoOutput, {
      secret,
      id: jobId,
      avatarVideoObject,
      avatarVideoProviderPredictionId: generatedAvatarVideo.predictionId,
      providerModels: [generatedAvatarVideo.modelId],
      progress: 0.68,
      updatedAt: new Date().toISOString(),
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
