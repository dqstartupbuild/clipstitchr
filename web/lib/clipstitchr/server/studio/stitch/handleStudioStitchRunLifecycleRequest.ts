import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { changeStudioStitchGenerationRun } from "./changeStudioStitchGenerationRun";
import { createStudioStitchErrorResponse } from "./createStudioStitchErrorResponse";
import { createStudioStitchJsonResponse } from "./createStudioStitchJsonResponse";
import { readStudioStitchRevisionRequest } from "./readStudioStitchRevisionRequest";
import { readStudioStitchRouteId } from "./readStudioStitchRouteId";

export async function handleStudioStitchRunLifecycleRequest(
  action: "cancel" | "resume" | "retry",
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
) {
  try {
    await assertStudioBetaApiAccess();
    const id = await readStudioStitchRouteId(context);
    const input = await readStudioStitchRevisionRequest(request);

    return createStudioStitchJsonResponse(
      await changeStudioStitchGenerationRun(action, id, input),
    );
  } catch (error) {
    return createStudioStitchErrorResponse(error);
  }
}
