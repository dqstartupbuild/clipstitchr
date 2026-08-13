import { api } from "@/convex/_generated/api";
import { createStudioClipsErrorResponse } from "../../../_lib/createStudioClipsErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../../../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsAuthenticatedClient } from "../../../_lib/getStudioClipsAuthenticatedClient";
import { readStudioClipsTaskActionRequest } from "../../../_lib/readStudioClipsTaskActionRequest";

export const runtime = "nodejs";

type StudioClipsCancelRouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function POST(
  request: Request,
  { params }: StudioClipsCancelRouteContext,
) {
  try {
    const [{ taskId }, input, { convex }] = await Promise.all([
      params,
      readStudioClipsTaskActionRequest(request),
      getStudioClipsAuthenticatedClient(),
    ]);
    return createStudioClipsPrivateJsonResponse(
      await convex.mutation(api.studioClipsTasks.cancel.cancel, {
        ...input,
        id: taskId,
      }),
    );
  } catch (error) {
    return createStudioClipsErrorResponse(
      error,
      "Unable to cancel Studio Clips task.",
    );
  }
}
