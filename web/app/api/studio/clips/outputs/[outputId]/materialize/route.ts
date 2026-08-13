import { api } from "@/convex/_generated/api";
import { createStudioClipsErrorResponse } from "../../../_lib/createStudioClipsErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../../../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsAuthenticatedClient } from "../../../_lib/getStudioClipsAuthenticatedClient";
import { readStudioClipsOutputMaterializeRequest } from "../../../_lib/readStudioClipsOutputMaterializeRequest";

export const runtime = "nodejs";

type StudioClipsOutputMaterializeRouteContext = {
  params: Promise<{ outputId: string }>;
};

export async function POST(
  request: Request,
  { params }: StudioClipsOutputMaterializeRouteContext,
) {
  try {
    const [{ outputId }, input, { convex }] = await Promise.all([
      params,
      readStudioClipsOutputMaterializeRequest(request),
      getStudioClipsAuthenticatedClient(),
    ]);
    return createStudioClipsPrivateJsonResponse(
      await convex.mutation(
        api.studioClipsOutputs.materializeToLibrary.materializeToLibrary,
        { ...input, id: outputId },
      ),
    );
  } catch (error) {
    return createStudioClipsErrorResponse(
      error,
      "Unable to save this Studio clip to the Library.",
    );
  }
}
