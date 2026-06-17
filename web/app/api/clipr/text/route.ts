import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createProductProfileFromConvexDocument } from "@/lib/clipstitchr/backend/createProductProfileFromConvexDocument";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createCliprTextGeneration } from "@/lib/clipstitchr/server/createCliprTextGeneration";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { readStitchrTextGenerationClipContexts } from "@/lib/clipstitchr/server/readStitchrTextGenerationClipContexts";
import { readSwiprSelectedSlideTextContext } from "@/lib/clipstitchr/server/readSwiprSelectedSlideTextContext";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import { getCliprDurationSeconds } from "@/lib/clipstitchr/utils/getCliprDurationSeconds";

export const runtime = "nodejs";

type CliprTextRequestBody = {
  durationSeconds?: unknown;
  productId?: unknown;
  purpose?: unknown;
  slideCount?: unknown;
  stitchrClipContexts?: unknown;
  swiprSelectedSlideTextContext?: unknown;
};

function getCliprTextPurpose(value: unknown): CliprTextPurpose {
  return value === "swipr" || value === "stitchr" ? value : "clipr";
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

    const body = (await request.json()) as CliprTextRequestBody;
    const productId =
      typeof body.productId === "string" ? body.productId.trim() : "";

    if (!productId) {
      throw new Error("Choose a saved product first.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeCliprHookScript, { secret });

    const productDocument = await convex.query(api.products.get, {
      id: productId,
    });

    if (!productDocument) {
      throw new Error("Saved product not found.");
    }

    const generation = await createCliprTextGeneration({
      durationSeconds: getCliprDurationSeconds(body.durationSeconds),
      product: createProductProfileFromConvexDocument(productDocument),
      purpose: getCliprTextPurpose(body.purpose),
      replicate: createReplicateClient(),
      slideCount:
        typeof body.slideCount === "number"
          ? Math.max(1, Math.min(8, Math.round(body.slideCount)))
          : 4,
      stitchrClipContexts: readStitchrTextGenerationClipContexts(
        body.stitchrClipContexts,
      ),
      swiprSelectedSlideTextContext: readSwiprSelectedSlideTextContext(
        body.swiprSelectedSlideTextContext,
      ),
    });

    return NextResponse.json({
      caption: generation.caption,
      description: generation.description,
      hashtags: generation.hashtags,
      hook: generation.filledHook,
      overlayText: generation.overlayText,
      script: generation.script,
      slides: generation.slides,
      socialCaption: generation.socialCaption,
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
            : "Unable to generate Clipr text.",
      },
      { status: 500 },
    );
  }
}
