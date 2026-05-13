import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { cliprMusicGenerationDefaults } from "@/lib/clipstitchr/constants/cliprMusicGenerationDefaults";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createStitchMusic } from "@/lib/clipstitchr/server/createStitchMusic";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { saveStitchMusicObject } from "@/lib/clipstitchr/server/saveStitchMusicObject";
import { createId } from "@/lib/clipstitchr/utils/createId";

export const runtime = "nodejs";

type StitchMusicCreateRequest = {
  stitchId?: unknown;
};

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const body = (await request.json()) as StitchMusicCreateRequest;
    const stitchId =
      typeof body.stitchId === "string" ? body.stitchId.trim() : "";

    if (!stitchId) {
      throw new Error("Choose a stitch first.");
    }

    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();
    const stitch = await convex.query(api.stitches.get, { id: stitchId });

    if (!stitch) {
      throw new Error("Stitch not found.");
    }

    await convex.mutation(api.rateLimits.consumeStitchMusicGeneration, {
      generatedSeconds: cliprMusicGenerationDefaults.durationSeconds,
      secret,
    });

    const generatedMusic = await createStitchMusic({
      replicate: createReplicateClient(),
      stitch,
    });

    await convex.mutation(api.rateLimits.consumeR2Upload, {
      secret,
      sizeBytes: generatedMusic.body.byteLength,
    });

    const audioObject = await saveStitchMusicObject({
      body: generatedMusic.body,
      contentType: generatedMusic.contentType,
      stitchId: `${stitch.id}-${createId()}`,
      userId,
    });
    const now = new Date().toISOString();

    return NextResponse.json({
      music: {
        audioObject,
        createdAt: now,
        durationSeconds: generatedMusic.durationSeconds,
        enabled: true,
        prompt: generatedMusic.prompt,
        providerModel: generatedMusic.modelId,
        providerPredictionId: generatedMusic.predictionId,
        updatedAt: now,
        volume: 1,
      },
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
            : "Unable to generate stitch music.",
      },
      { status: 500 },
    );
  }
}
