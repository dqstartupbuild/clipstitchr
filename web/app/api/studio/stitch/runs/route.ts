import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { createStudioStitchErrorResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchErrorResponse";
import { createStudioStitchJsonResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchJsonResponse";
import { createStudioStitchGenerationIntent } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchGenerationIntent";
import { readStudioStitchRunRequest } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchRunRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await assertStudioBetaApiAccess();
    return createStudioStitchJsonResponse(
      await createStudioStitchGenerationIntent(
        await readStudioStitchRunRequest(request),
      ),
    );
  } catch (error) {
    return createStudioStitchErrorResponse(error);
  }
}
