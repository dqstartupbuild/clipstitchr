import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createSwiprBackgroundAnalysisOutputText } from "@/lib/clipstitchr/server/createSwiprBackgroundAnalysisOutputText";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getUploadAnalysisFormFile } from "@/lib/clipstitchr/server/getUploadAnalysisFormFile";
import { getUploadAnalysisFormString } from "@/lib/clipstitchr/server/getUploadAnalysisFormString";
import { parseSwiprBackgroundAnalysis } from "@/lib/clipstitchr/server/parseSwiprBackgroundAnalysis";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { runAnalysisWithCredit } from "@/lib/clipstitchr/server/usage/runAnalysisWithCredit";

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

    const formData = await request.formData();
    const originalName = getUploadAnalysisFormString(formData, "originalName");
    const convex = createAuthenticatedConvexHttpClient(convexToken);

    await convex.mutation(api.rateLimits.consumeSwiprBackgroundAnalyze, {
      secret: getRateLimitApiSecret(),
    });

    const analysis = await runAnalysisWithCredit({
      client: convex,
      operation: "ai_analysis",
      secret: getRateLimitApiSecret(),
      work: async () => {
        const outputText = await createSwiprBackgroundAnalysisOutputText({
          file: getUploadAnalysisFormFile(formData, "file"),
          originalName,
          replicate: createReplicateClient(),
        });

        return parseSwiprBackgroundAnalysis(outputText, originalName);
      },
    });

    return NextResponse.json(analysis);
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
            : "Unable to analyze this Swipr background.",
      },
      { status: 500 },
    );
  }
}
