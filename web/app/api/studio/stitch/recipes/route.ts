import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { createStudioStitchErrorResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchErrorResponse";
import { createStudioStitchJsonResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchJsonResponse";
import { createStudioStitchRecipeRecord } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchRecipeRecord";
import { listStudioStitchRecipes } from "@/lib/clipstitchr/server/studio/stitch/listStudioStitchRecipes";
import { readStudioStitchIncludeArchived } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchIncludeArchived";
import { readStudioStitchProductId } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchProductId";
import { readStudioStitchRecipeRequest } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchRecipeRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await assertStudioBetaApiAccess();
    return createStudioStitchJsonResponse(
      await listStudioStitchRecipes(
        readStudioStitchProductId(request),
        readStudioStitchIncludeArchived(request),
      ),
    );
  } catch (error) {
    return createStudioStitchErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await assertStudioBetaApiAccess();
    return createStudioStitchJsonResponse(
      await createStudioStitchRecipeRecord(
        await readStudioStitchRecipeRequest(request),
      ),
    );
  } catch (error) {
    return createStudioStitchErrorResponse(error);
  }
}
