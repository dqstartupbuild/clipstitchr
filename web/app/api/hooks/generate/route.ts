import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createHookGenerationPrompt } from "@/lib/clipstitchr/server/createHookGenerationPrompt";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getCliprScriptModelId } from "@/lib/clipstitchr/server/getCliprScriptModelId";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { parseHookGenerationResult } from "@/lib/clipstitchr/server/parseHookGenerationResult";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import type { HookGenerationPurpose } from "@/lib/clipstitchr/types/HookGenerationPurpose";
import { selectRandomCliprHookResource } from "@/lib/clipstitchr/utils/selectRandomCliprHookResource";

export const runtime = "nodejs";

const HOOK_GENERATION_SYSTEM_PROMPT =
  "You write short social creative text. Return valid JSON only.";

type HookGenerationRequestBody = {
  productId?: unknown;
  purpose?: unknown;
  slideCount?: unknown;
};

function getHookGenerationPurpose(value: unknown): HookGenerationPurpose {
  if (value === "swipr-slides" || value === "stitchr-overlay") {
    return value;
  }

  throw new Error("Unsupported hook generation purpose.");
}

function getSlideCount(value: unknown) {
  const count = typeof value === "number" ? value : Number(value);

  return Math.min(8, Math.max(3, Number.isFinite(count) ? Math.round(count) : 3));
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

    const body = (await request.json()) as HookGenerationRequestBody;
    const productId =
      typeof body.productId === "string" ? body.productId.trim() : "";
    const purpose = getHookGenerationPurpose(body.purpose);
    const slideCount =
      purpose === "swipr-slides" ? getSlideCount(body.slideCount) : undefined;

    if (!productId) {
      throw new Error("Choose a saved product before generating text.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();
    const productDocument = await convex.query(api.products.get, {
      id: productId,
    });

    if (!productDocument) {
      throw new Error("Saved product not found.");
    }

    await convex.mutation(api.rateLimits.consumeHookGeneration, {
      secret,
    });

    const product = createProductProfileFromConvexDocument(productDocument);
    const replicate = createReplicateClient();
    const { style, template } = selectRandomCliprHookResource();
    const modelId = getCliprScriptModelId();
    const prediction = await replicate.predictions.create({
      model: modelId,
      input: {
        prompt: createHookGenerationPrompt({
          product,
          purpose,
          slideCount,
          style,
          template,
        }),
        system_prompt: HOOK_GENERATION_SYSTEM_PROMPT,
        temperature: 0.75,
        max_completion_tokens: 600,
      },
    });
    const outputText = await getCompletedReplicatePredictionOutputText({
      failureMessage: "Replicate did not complete hook generation.",
      prediction,
      replicate,
    });
    const result = parseHookGenerationResult({
      outputText,
      purpose,
      slideCount,
    });

    return NextResponse.json({
      ...result,
      modelId,
      styleKey: style.styleKey,
      templateId: template.templateId,
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
            : "Unable to generate text.",
      },
      { status: 500 },
    );
  }
}
