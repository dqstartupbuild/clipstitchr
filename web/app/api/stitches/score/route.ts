import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createStitchScoreOutputText } from "@/lib/clipstitchr/server/createStitchScoreOutputText";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { readStitchScoreRequest } from "@/lib/clipstitchr/server/readStitchScoreRequest";
import { getStitchScoreSourceClipIds } from "@/lib/clipstitchr/utils/getStitchScoreSourceClipIds";
import { parseStitchScore } from "@/lib/clipstitchr/utils/parseStitchScore";

export const runtime = "nodejs";

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

    const { stitchId } = await readStitchScoreRequest(request);
    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const stitch = await convex.query(api.stitches.get, { id: stitchId });

    if (!stitch) {
      return NextResponse.json(
        { message: "Stitch not found." },
        { status: 404 },
      );
    }

    await convex.mutation(api.rateLimits.consumeStitchScoreAnalysis, {
      secret: getRateLimitApiSecret(),
    });

    const sourceClipIds = getStitchScoreSourceClipIds(stitch);
    const sourceClips = (
      await Promise.all(
        sourceClipIds.map((id) => convex.query(api.videoClips.get, { id })),
      )
    ).filter((clip): clip is Doc<"videoClips"> => Boolean(clip));
    const outputText = await createStitchScoreOutputText({
      replicate: createReplicateClient(),
      sourceClips,
      stitch,
      userId,
    });
    const stitchScore = parseStitchScore(outputText);

    if (!stitchScore) {
      throw new Error("The stitch score came back empty.");
    }

    await convex.mutation(api.stitches.updateScore, {
      id: stitch.id,
      stitchScore,
    });

    return NextResponse.json({ stitchScore });
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
            : "Unable to score this stitch.",
      },
      { status: 500 },
    );
  }
}
