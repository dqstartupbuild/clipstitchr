import { NextResponse } from "next/server";
import type { Prediction } from "replicate";
import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createCliprScriptPrompt } from "@/lib/clipstitchr/server/createCliprScriptPrompt";
import { createCliprSeedancePrompt } from "@/lib/clipstitchr/server/createCliprSeedancePrompt";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getCliprScriptModelId } from "@/lib/clipstitchr/server/getCliprScriptModelId";
import { getCliprTextToSpeechModelId } from "@/lib/clipstitchr/server/getCliprTextToSpeechModelId";
import { getCliprVideoModelId } from "@/lib/clipstitchr/server/getCliprVideoModelId";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import { getReplicatePredictionStatus } from "@/lib/clipstitchr/server/getReplicatePredictionStatus";
import { getSwaprFormFile } from "@/lib/clipstitchr/server/getSwaprFormFile";
import { getSwaprFormString } from "@/lib/clipstitchr/server/getSwaprFormString";
import { parseCliprGeneratedScript } from "@/lib/clipstitchr/server/parseCliprGeneratedScript";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { sanitizeCliprSeedanceText } from "@/lib/clipstitchr/server/sanitizeCliprSeedanceText";
import {
  CLIPR_SEEDANCE_ASPECT_RATIO,
  CLIPR_SEEDANCE_RESOLUTION,
} from "@/lib/clipstitchr/constants/cliprSeedanceSettings";
import { getCliprDurationSeconds } from "@/lib/clipstitchr/utils/getCliprDurationSeconds";
import { getCliprSeedanceSegmentDurationSeconds } from "@/lib/clipstitchr/utils/getCliprSeedanceSegmentDurationSeconds";
import { getCliprSeedanceSpeechTargetSeconds } from "@/lib/clipstitchr/utils/getCliprSeedanceSpeechTargetSeconds";
import { getCliprVoiceId } from "@/lib/clipstitchr/utils/getCliprVoiceId";
import { selectRandomCliprHookResource } from "@/lib/clipstitchr/utils/selectRandomCliprHookResource";

export const runtime = "nodejs";

const CLIPR_SCRIPT_SYSTEM_PROMPT =
  "You write short-form engagement scripts. Return valid JSON only.";

function getPredictionError(prediction: Prediction) {
  return typeof prediction.error === "string"
    ? prediction.error
    : prediction.error
      ? JSON.stringify(prediction.error)
      : undefined;
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const formData = await request.formData();
    const image = getSwaprFormFile(formData, "image");
    const productId = getSwaprFormString(formData, "productId").trim();
    const durationSeconds = getCliprDurationSeconds(
      getSwaprFormString(formData, "durationSeconds"),
    );
    const voice = getCliprVoiceId(getSwaprFormString(formData, "voice"));
    const previousScripts = getSwaprFormString(formData, "previousScripts");
    const remainingSecondsText = getSwaprFormString(formData, "remainingSeconds");
    const segmentIndexText = getSwaprFormString(formData, "segmentIndex");
    const remainingSeconds = Number(remainingSecondsText);
    const segmentIndex = Math.max(1, Number(segmentIndexText) || 1);

    if (!productId) {
      throw new Error("Choose a saved product before creating a Clipr clip.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();
    const productDocument = await convex.query(api.products.get, {
      id: productId,
    });

    if (!productDocument) {
      throw new Error("Saved product not found.");
    }

    const remainingSegmentSeconds = Number.isFinite(remainingSeconds)
      ? Math.min(durationSeconds, Math.max(1, remainingSeconds))
      : durationSeconds;
    const segmentDurationSeconds =
      getCliprSeedanceSegmentDurationSeconds(remainingSegmentSeconds);
    const speechTargetSeconds =
      getCliprSeedanceSpeechTargetSeconds(segmentDurationSeconds);

    await convex.mutation(api.rateLimits.consumeCliprSegmentGenerate, {
      estimatedSeconds: segmentDurationSeconds,
      secret,
    });

    const product = createProductProfileFromConvexDocument(productDocument);
    const replicate = createReplicateClient();
    const { style, template } = selectRandomCliprHookResource();
    const scriptModelId = getCliprScriptModelId();
    const scriptPrediction = await replicate.predictions.create({
      model: scriptModelId,
      input: {
        prompt: createCliprScriptPrompt({
          durationSeconds,
          previousScripts,
          product,
          remainingSeconds: speechTargetSeconds,
          segmentIndex,
          style,
          template,
        }),
        system_prompt: CLIPR_SCRIPT_SYSTEM_PROMPT,
        temperature: 0.7,
        max_completion_tokens: 1200,
      },
    });
    const scriptOutputText = await getCompletedReplicatePredictionOutputText({
      failureMessage: "Replicate did not complete Clipr script generation.",
      prediction: scriptPrediction,
      replicate,
    });
    const generatedScript = parseCliprGeneratedScript(scriptOutputText);
    const seedanceScript = sanitizeCliprSeedanceText(generatedScript.script);
    const seedanceAvatarPrompt = sanitizeCliprSeedanceText(
      generatedScript.avatarPrompt,
    );
    const textToSpeechModelId = getCliprTextToSpeechModelId();
    const audioPrediction = await replicate.predictions.create({
      model: textToSpeechModelId,
      input: {
        prompt: seedanceScript,
        voice,
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.25,
        speed: 1,
        language_code: "en",
      },
    });
    const audioCreatedAt = new Date().toISOString();

    await convex.mutation(api.replicateJobs.recordCliprAudioJob, {
      secret,
      predictionId: audioPrediction.id,
      modelId: textToSpeechModelId,
      status: getReplicatePredictionStatus(audioPrediction.status),
      createdAt: audioCreatedAt,
      updatedAt: audioCreatedAt,
    });

    const completedAudioPrediction = await replicate.wait(audioPrediction, {
      interval: 1000,
    });
    const audioStatus = getReplicatePredictionStatus(
      completedAudioPrediction.status,
    );
    const audioOutputUrl =
      completedAudioPrediction.status === "succeeded"
        ? getReplicateOutputUrl((completedAudioPrediction as Prediction).output)
        : undefined;

    await convex.mutation(api.replicateJobs.updateCliprAudioJobStatus, {
      secret,
      predictionId: audioPrediction.id,
      status: audioStatus,
      outputUrl: audioOutputUrl,
      error: getPredictionError(completedAudioPrediction as Prediction),
      updatedAt: new Date().toISOString(),
    });

    if (completedAudioPrediction.status !== "succeeded") {
      throw new Error(
        getPredictionError(completedAudioPrediction as Prediction) ??
          "Replicate did not complete Clipr voice generation.",
      );
    }

    if (!audioOutputUrl) {
      throw new Error("Replicate completed but did not return Clipr audio.");
    }

    const videoModelId = getCliprVideoModelId();
    const videoPrediction = await replicate.predictions.create({
      model: videoModelId,
      input: {
        prompt: createCliprSeedancePrompt({
          avatarPrompt: seedanceAvatarPrompt,
          script: seedanceScript,
        }),
        reference_images: [image],
        reference_audios: [audioOutputUrl],
        duration: segmentDurationSeconds,
        resolution: CLIPR_SEEDANCE_RESOLUTION,
        aspect_ratio: CLIPR_SEEDANCE_ASPECT_RATIO,
        generate_audio: true,
      },
    });
    const videoCreatedAt = new Date().toISOString();

    await convex.mutation(api.replicateJobs.recordCliprVideoJob, {
      secret,
      predictionId: videoPrediction.id,
      modelId: videoModelId,
      status: getReplicatePredictionStatus(videoPrediction.status),
      createdAt: videoCreatedAt,
      updatedAt: videoCreatedAt,
    });

    const videoStatus = getReplicatePredictionStatus(videoPrediction.status);
    const videoOutputUrl =
      videoPrediction.status === "succeeded"
        ? getReplicateOutputUrl((videoPrediction as Prediction).output)
        : undefined;

    if (videoOutputUrl) {
      await convex.mutation(api.replicateJobs.updateCliprVideoJobStatus, {
        secret,
        predictionId: videoPrediction.id,
        status: videoStatus,
        outputUrl: videoOutputUrl,
        error: getPredictionError(videoPrediction as Prediction),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      audioPredictionId: audioPrediction.id,
      avatarPrompt: seedanceAvatarPrompt,
      durationSeconds,
      hook: generatedScript.hook,
      modelIds: {
        script: scriptModelId,
        textToSpeech: textToSpeechModelId,
        video: videoModelId,
      },
      script: seedanceScript,
      segmentIndex,
      segmentDurationSeconds,
      styleKey: style.styleKey,
      templateId: template.templateId,
      title: generatedScript.title,
      videoPredictionId: videoPrediction.id,
      videoStatus,
      videoUrl: videoOutputUrl,
      voice,
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to create this Clipr segment.",
      },
      { status: 500 },
    );
  }
}
