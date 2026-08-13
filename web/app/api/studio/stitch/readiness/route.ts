import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { createStudioStitchErrorResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchErrorResponse";
import { createStudioStitchJsonResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchJsonResponse";
import { getStudioStitchReadiness } from "@/lib/clipstitchr/server/studio/stitch/getStudioStitchReadiness";
import { readStudioStitchProductId } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchProductId";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await assertStudioBetaApiAccess();
    return createStudioStitchJsonResponse(
      await getStudioStitchReadiness(readStudioStitchProductId(request)),
    );
  } catch (error) {
    return createStudioStitchErrorResponse(error);
  }
}
