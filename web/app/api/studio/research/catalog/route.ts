import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { createStudioLazyReelErrorResponse } from "@/lib/clipstitchr/server/studio/research/createStudioLazyReelErrorResponse";
import { createStudioLazyReelJsonResponse } from "@/lib/clipstitchr/server/studio/research/createStudioLazyReelJsonResponse";
import { getStudioLazyReelCatalog } from "@/lib/clipstitchr/server/studio/research/getStudioLazyReelCatalog";
import { readStudioLazyReelCatalogProductId } from "@/lib/clipstitchr/server/studio/research/readStudioLazyReelCatalogProductId";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await assertStudioBetaApiAccess();

    return createStudioLazyReelJsonResponse(
      await getStudioLazyReelCatalog(
        readStudioLazyReelCatalogProductId(request),
      ),
    );
  } catch (error) {
    return createStudioLazyReelErrorResponse(error);
  }
}
