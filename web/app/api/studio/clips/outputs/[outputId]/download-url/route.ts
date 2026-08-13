import { api } from "@/convex/_generated/api";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { assertStudioClipsOutputObjectKey } from "@/lib/clipstitchr/server/studio/clips/assertStudioClipsOutputObjectKey";
import { createStudioClipsErrorResponse } from "../../../_lib/createStudioClipsErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../../../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsAuthenticatedClient } from "../../../_lib/getStudioClipsAuthenticatedClient";
import { readStudioClipsOutputAccessRequest } from "../../../_lib/readStudioClipsOutputAccessRequest";

export const runtime = "nodejs";

type StudioClipsOutputDownloadRouteContext = {
  params: Promise<{ outputId: string }>;
};

export async function POST(
  request: Request,
  { params }: StudioClipsOutputDownloadRouteContext,
) {
  try {
    const [{ outputId }, input, { convex, userId }] = await Promise.all([
      params,
      readStudioClipsOutputAccessRequest(request),
      getStudioClipsAuthenticatedClient(),
    ]);
    await convex.mutation(
      api.studioClipsRateLimits.reserveStaticRead.reserveStaticRead,
      { productId: input.productId },
    );
    const output = await convex.query(
      api.studioClipsOutputs.getOwned.getOwned,
      { ...input, id: outputId },
    );
    if (!output) {
      return createStudioClipsPrivateJsonResponse(
        { error: "Studio Clips output not found." },
        { status: 404 },
      );
    }
    assertStudioClipsOutputObjectKey({
      objectKey: output.objectKey,
      ownerId: userId,
      productId: input.productId,
      workId: output.renderRevisionId ?? output.taskId,
    });
    await convex.mutation(
      api.studioBetaRateLimits.consumeStudioBetaR2Download
        .consumeStudioBetaR2Download,
      { productId: input.productId, secret: getRateLimitApiSecret() },
    );
    const signed = await getR2DownloadSignedUrl(output.objectKey);
    return createStudioClipsPrivateJsonResponse({
      expiresIn: signed.expiresIn,
      url: signed.url,
    });
  } catch (error) {
    return createStudioClipsErrorResponse(
      error,
      "Unable to create the Studio Clips download.",
    );
  }
}
