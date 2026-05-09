import { NextResponse } from "next/server";
import type { Prediction } from "replicate";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createUploadAnalysisPrompt } from "@/lib/clipstitchr/server/createUploadAnalysisPrompt";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getUploadAnalysisFormFile } from "@/lib/clipstitchr/server/getUploadAnalysisFormFile";
import { getUploadAnalysisFormString } from "@/lib/clipstitchr/server/getUploadAnalysisFormString";
import { getUploadAnalysisKind } from "@/lib/clipstitchr/server/getUploadAnalysisKind";
import { getUploadAnalysisModelId } from "@/lib/clipstitchr/server/getUploadAnalysisModelId";
import { getUploadAnalysisOutputText } from "@/lib/clipstitchr/server/getUploadAnalysisOutputText";
import { parseUploadAssetAnalysis } from "@/lib/clipstitchr/server/parseUploadAssetAnalysis";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

const UPLOAD_ANALYSIS_SYSTEM_PROMPT =
  "You create concise, searchable metadata for uploaded marketing media.";

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

    const convex = createAuthenticatedConvexHttpClient(convexToken);

    await convex.mutation(api.rateLimits.consumeUploadAnalysis, {
      secret: getRateLimitApiSecret(),
    });

    const formData = await request.formData();
    const file = getUploadAnalysisFormFile(formData, "file");
    const originalName = getUploadAnalysisFormString(formData, "originalName");
    const mediaKind = getUploadAnalysisKind(
      getUploadAnalysisFormString(formData, "mediaKind"),
    );
    const replicate = createReplicateClient();
    const prediction = await replicate.predictions.create({
      model: getUploadAnalysisModelId(),
      input: {
        image_input: [file],
        prompt: createUploadAnalysisPrompt({ mediaKind, originalName }),
        system_prompt: UPLOAD_ANALYSIS_SYSTEM_PROMPT,
        temperature: 0.2,
        max_completion_tokens: 400,
      },
    });
    const completedPrediction = await replicate.wait(prediction, {
      interval: 1000,
    });

    if (completedPrediction.status !== "succeeded") {
      throw new Error(
        typeof completedPrediction.error === "string"
          ? completedPrediction.error
          : "Replicate did not complete upload analysis.",
      );
    }

    const outputText = getUploadAnalysisOutputText(
      (completedPrediction as Prediction).output,
    );

    return NextResponse.json(
      parseUploadAssetAnalysis(outputText, originalName),
    );
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
            : "Unable to analyze this upload.",
      },
      { status: 500 },
    );
  }
}
