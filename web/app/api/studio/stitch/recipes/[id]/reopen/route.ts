import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { createStudioStitchErrorResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchErrorResponse";
import { createStudioStitchJsonResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchJsonResponse";
import { readStudioStitchRevisionRequest } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchRevisionRequest";
import { readStudioStitchRouteId } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchRouteId";
import { reopenStudioStitchRecipe } from "@/lib/clipstitchr/server/studio/stitch/reopenStudioStitchRecipe";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
) {
  try {
    await assertStudioBetaApiAccess();
    const id = await readStudioStitchRouteId(context);
    return createStudioStitchJsonResponse(
      await reopenStudioStitchRecipe(
        id,
        await readStudioStitchRevisionRequest(request),
      ),
    );
  } catch (error) {
    return createStudioStitchErrorResponse(error);
  }
}
