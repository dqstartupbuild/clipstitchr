import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { approveStudioStitchReviewSubset } from "@/lib/clipstitchr/server/studio/stitch/approveStudioStitchReviewSubset";
import { createStudioStitchErrorResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchErrorResponse";
import { createStudioStitchJsonResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchJsonResponse";
import { readStudioStitchApproveReviewRequest } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchApproveReviewRequest";
import { readStudioStitchRouteId } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchRouteId";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
) {
  try {
    await assertStudioBetaApiAccess();
    const reviewId = await readStudioStitchRouteId(context);
    return createStudioStitchJsonResponse(
      await approveStudioStitchReviewSubset(
        reviewId,
        await readStudioStitchApproveReviewRequest(request),
      ),
    );
  } catch (error) {
    return createStudioStitchErrorResponse(error);
  }
}
