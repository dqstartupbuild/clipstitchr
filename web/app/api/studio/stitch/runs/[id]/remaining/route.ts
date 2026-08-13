import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { createRemainingStudioStitchGenerationIntent } from "@/lib/clipstitchr/server/studio/stitch/createRemainingStudioStitchGenerationIntent";
import { createStudioStitchErrorResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchErrorResponse";
import { createStudioStitchJsonResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchJsonResponse";
import { readStudioStitchRemainingRequest } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchRemainingRequest";
import { readStudioStitchRouteId } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchRouteId";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
) {
  try {
    await assertStudioBetaApiAccess();
    const parentRunId = await readStudioStitchRouteId(context);
    return createStudioStitchJsonResponse(
      await createRemainingStudioStitchGenerationIntent(
        parentRunId,
        await readStudioStitchRemainingRequest(request),
      ),
    );
  } catch (error) {
    return createStudioStitchErrorResponse(error);
  }
}
