import { api } from "@/convex/_generated/api";
import { createStudioClipsErrorResponse } from "../../_lib/createStudioClipsErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsAuthenticatedClient } from "../../_lib/getStudioClipsAuthenticatedClient";
import { readStudioClipsProductId } from "../../_lib/readStudioClipsProductId";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StudioClipsRenderRevisionRouteContext = {
  params: Promise<{ revisionId: string }>;
};

export async function GET(
  request: Request,
  { params }: StudioClipsRenderRevisionRouteContext,
) {
  try {
    const [{ revisionId }, productId, { convex }] = await Promise.all([
      params,
      Promise.resolve(readStudioClipsProductId(request)),
      getStudioClipsAuthenticatedClient(),
    ]);
    await convex.mutation(
      api.studioClipsRateLimits.reserveStaticRead.reserveStaticRead,
      { productId },
    );
    const renderRevision = await convex.query(
      api.studioClipsRenderRevisions.get.get,
      { id: revisionId, productId },
    );
    if (!renderRevision) {
      return createStudioClipsPrivateJsonResponse(
        { error: "Studio Clips render revision not found." },
        { status: 404 },
      );
    }
    return createStudioClipsPrivateJsonResponse({ renderRevision });
  } catch (error) {
    return createStudioClipsErrorResponse(
      error,
      "Unable to load this Studio Clips render revision.",
    );
  }
}
