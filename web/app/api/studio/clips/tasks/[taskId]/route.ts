import { api } from "@/convex/_generated/api";
import { createStudioClipsErrorResponse } from "../../_lib/createStudioClipsErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsAuthenticatedClient } from "../../_lib/getStudioClipsAuthenticatedClient";
import { readStudioClipsProductId } from "../../_lib/readStudioClipsProductId";
import { readStudioClipsTaskActionRequest } from "../../_lib/readStudioClipsTaskActionRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StudioClipsTaskRouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function GET(
  request: Request,
  { params }: StudioClipsTaskRouteContext,
) {
  try {
    const [{ taskId }, productId, { convex }] = await Promise.all([
      params,
      Promise.resolve(readStudioClipsProductId(request)),
      getStudioClipsAuthenticatedClient(),
    ]);
    await convex.mutation(
      api.studioClipsRateLimits.reserveStaticRead.reserveStaticRead,
      { productId },
    );
    const task = await convex.query(api.studioClipsTasks.get.get, {
      id: taskId,
      productId,
    });
    if (!task) {
      return createStudioClipsPrivateJsonResponse(
        { error: "Studio Clips task not found." },
        { status: 404 },
      );
    }
    return createStudioClipsPrivateJsonResponse({ task });
  } catch (error) {
    return createStudioClipsErrorResponse(
      error,
      "Unable to load Studio Clips task.",
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: StudioClipsTaskRouteContext,
) {
  try {
    const [{ taskId }, input, { convex }] = await Promise.all([
      params,
      readStudioClipsTaskActionRequest(request),
      getStudioClipsAuthenticatedClient(),
    ]);
    return createStudioClipsPrivateJsonResponse(
      await convex.mutation(api.studioClipsTasks.archive.archive, {
        ...input,
        id: taskId,
      }),
    );
  } catch (error) {
    return createStudioClipsErrorResponse(
      error,
      "Unable to archive Studio Clips task.",
    );
  }
}
