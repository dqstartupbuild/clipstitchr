import { readStudioLazyReelResearchRunRequest } from "@/lib/clipstitchr/server/studio/lazyreel/http/readStudioLazyReelResearchRunRequest";
import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { createStudioLazyReelErrorResponse } from "@/lib/clipstitchr/server/studio/research/createStudioLazyReelErrorResponse";
import { createStudioLazyReelJsonResponse } from "@/lib/clipstitchr/server/studio/research/createStudioLazyReelJsonResponse";
import { runStudioLazyReelResearchTool } from "@/lib/clipstitchr/server/studio/research/runStudioLazyReelResearchTool";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await assertStudioBetaApiAccess();

    return createStudioLazyReelJsonResponse(
      await runStudioLazyReelResearchTool(
        await readStudioLazyReelResearchRunRequest(request),
      ),
    );
  } catch (error) {
    return createStudioLazyReelErrorResponse(error);
  }
}
