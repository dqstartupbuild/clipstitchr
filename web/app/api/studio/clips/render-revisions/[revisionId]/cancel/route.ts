import { api } from "@/convex/_generated/api";
import { createStudioClipsErrorResponse } from "../../../_lib/createStudioClipsErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../../../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsAuthenticatedClient } from "../../../_lib/getStudioClipsAuthenticatedClient";
import { readStudioClipsTaskActionRequest } from "../../../_lib/readStudioClipsTaskActionRequest";

export const runtime = "nodejs";

type StudioClipsRenderRevisionCancelContext = {
  params: Promise<{ revisionId: string }>;
};

export async function POST(
  request: Request,
  { params }: StudioClipsRenderRevisionCancelContext,
) {
  try {
    const [{ revisionId }, input, { convex }] = await Promise.all([
      params,
      readStudioClipsTaskActionRequest(request),
      getStudioClipsAuthenticatedClient(),
    ]);
    return createStudioClipsPrivateJsonResponse(
      await convex.mutation(api.studioClipsRenderRevisions.cancel.cancel, {
        ...input,
        id: revisionId,
      }),
    );
  } catch (error) {
    return createStudioClipsErrorResponse(
      error,
      "Unable to cancel this Studio Clips render revision.",
    );
  }
}
