import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { createStudioStitchErrorResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchErrorResponse";
import { createStudioStitchJsonResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchJsonResponse";
import { getStudioStitchGenerationRun } from "@/lib/clipstitchr/server/studio/stitch/getStudioStitchGenerationRun";
import { readStudioStitchProductId } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchProductId";
import { readStudioStitchRouteId } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchRouteId";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
) {
  try {
    await assertStudioBetaApiAccess();
    return createStudioStitchJsonResponse(
      await getStudioStitchGenerationRun(
        await readStudioStitchRouteId(context),
        readStudioStitchProductId(request),
      ),
    );
  } catch (error) {
    return createStudioStitchErrorResponse(error);
  }
}
