import { NextResponse } from "next/server";
import type { Prediction } from "replicate";
import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createCliprScriptPrompt } from "@/lib/clipstitchr/server/createCliprScriptPrompt";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getCliprAvatarModelId } from "@/lib/clipstitchr/server/getCliprAvatarModelId";
import { getCliprScriptModelId } from "@/lib/clipstitchr/server/getCliprScriptModelId";
import { getCliprTextToSpeechModelId } from "@/lib/clipstitchr/server/getCliprTextToSpeechModelId";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import { getReplicatePredictionStatus } from "@/lib/clipstitchr/server/getReplicatePredictionStatus";
import { getSwaprFormFile } from "@/lib/clipstitchr/server/getSwaprFormFile";
import { getSwaprFormString } from "@/lib/clipstitchr/server/getSwaprFormString";
import { parseCliprGeneratedScript } from "@/lib/clipstitchr/server/parseCliprGeneratedScript";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { getCliprDurationSeconds } from "@/lib/clipstitchr/utils/getCliprDurationSeconds";
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

    const estimatedSeconds = Number.isFinite(remainingSeconds)
      ? Math.min(durationSeconds, Math.max(1, remainingSeconds))
      : durationSeconds;

    await convex.mutation(api.rateLimits.consumeCliprSegmentGenerate, {
      estimatedSeconds,
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
          remainingSeconds: Number.isFinite(remainingSeconds)
            ? remainingSeconds
            : undefined,
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
    const textToSpeechModelId = getCliprTextToSpeechModelId();
    const audioPrediction = await replicate.predictions.create({
      model: textToSpeechModelId,
      input: {
        prompt: generatedScript.script,
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

    const avatarModelId = getCliprAvatarModelId();
    const videoPrediction = await replicate.predictions.create({
      model: avatarModelId,
      input: {
        image,
        audio: audioOutputUrl,
        prompt: generatedScript.avatarPrompt,
        mode: "std",
      },
    });
    const videoCreatedAt = new Date().toISOString();

    await convex.mutation(api.replicateJobs.recordCliprVideoJob, {
      secret,
      predictionId: videoPrediction.id,
      modelId: avatarModelId,
      status: getReplicatePredictionStatus(videoPrediction.status),
      createdAt: videoCreatedAt,
      updatedAt: videoCreatedAt,
    });

    const completedVideoPrediction = await replicate.wait(videoPrediction, {
      interval: 2000,
    });
    const videoStatus = getReplicatePredictionStatus(
      completedVideoPrediction.status,
    );
    const videoOutputUrl =
      completedVideoPrediction.status === "succeeded"
        ? getReplicateOutputUrl((completedVideoPrediction as Prediction).output)
        : undefined;

    await convex.mutation(api.replicateJobs.updateCliprVideoJobStatus, {
      secret,
      predictionId: videoPrediction.id,
      status: videoStatus,
      outputUrl: videoOutputUrl,
      error: getPredictionError(completedVideoPrediction as Prediction),
      updatedAt: new Date().toISOString(),
    });

    if (completedVideoPrediction.status !== "succeeded") {
      throw new Error(
        getPredictionError(completedVideoPrediction as Prediction) ??
          "Replicate did not complete Clipr video generation.",
      );
    }

    if (!videoOutputUrl) {
      throw new Error("Replicate completed but did not return Clipr video.");
    }

    return NextResponse.json({
      audioPredictionId: audioPrediction.id,
      avatarPrompt: generatedScript.avatarPrompt,
      durationSeconds,
      hook: generatedScript.hook,
      modelIds: {
        avatar: avatarModelId,
        script: scriptModelId,
        textToSpeech: textToSpeechModelId,
      },
      script: generatedScript.script,
      segmentIndex,
      styleKey: style.styleKey,
      templateId: template.templateId,
      title: generatedScript.title,
      videoPredictionId: videoPrediction.id,
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
