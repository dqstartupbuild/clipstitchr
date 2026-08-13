import { api } from "@/convex/_generated/api";
import { createStudioClipsErrorResponse } from "../../../_lib/createStudioClipsErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../../../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsAuthenticatedClient } from "../../../_lib/getStudioClipsAuthenticatedClient";
import { readStudioClipsTaskActionRequest } from "../../../_lib/readStudioClipsTaskActionRequest";

export const runtime = "nodejs";

type StudioClipsResumeRouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function POST(
  request: Request,
  { params }: StudioClipsResumeRouteContext,
) {
  try {
    const [{ taskId }, input, { convex }] = await Promise.all([
      params,
      readStudioClipsTaskActionRequest(request),
      getStudioClipsAuthenticatedClient(),
    ]);
    return createStudioClipsPrivateJsonResponse(
      await convex.mutation(api.studioClipsTasks.resume.resume, {
        ...input,
        id: taskId,
      }),
    );
  } catch (error) {
    return createStudioClipsErrorResponse(
      error,
      "Unable to resume Studio Clips task.",
    );
  }
}
