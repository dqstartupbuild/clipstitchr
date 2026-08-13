import { api } from "@/convex/_generated/api";
import { createStudioClipsErrorResponse } from "../../_lib/createStudioClipsErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsAuthenticatedClient } from "../../_lib/getStudioClipsAuthenticatedClient";
import { readStudioClipsOutputUpdateRequest } from "../../_lib/readStudioClipsOutputUpdateRequest";

export const runtime = "nodejs";

type StudioClipsOutputRouteContext = {
  params: Promise<{ outputId: string }>;
};

export async function PATCH(
  request: Request,
  { params }: StudioClipsOutputRouteContext,
) {
  try {
    const [{ outputId }, input, { convex }] = await Promise.all([
      params,
      readStudioClipsOutputUpdateRequest(request),
      getStudioClipsAuthenticatedClient(),
    ]);
    return createStudioClipsPrivateJsonResponse(
      await convex.mutation(
        api.studioClipsOutputs.updateEditMetadata.updateEditMetadata,
        { ...input, id: outputId },
      ),
    );
  } catch (error) {
    return createStudioClipsErrorResponse(
      error,
      "Unable to update Studio Clips output.",
    );
  }
}
