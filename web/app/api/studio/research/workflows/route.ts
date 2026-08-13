import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { readStudioLazyReelWorkflowRunRequest } from "@/lib/clipstitchr/server/studio/lazyreel/http/readStudioLazyReelWorkflowRunRequest";
import { createStudioLazyReelErrorResponse } from "@/lib/clipstitchr/server/studio/research/createStudioLazyReelErrorResponse";
import { createStudioLazyReelJsonResponse } from "@/lib/clipstitchr/server/studio/research/createStudioLazyReelJsonResponse";
import { runStudioLazyReelWorkflow } from "@/lib/clipstitchr/server/studio/research/runStudioLazyReelWorkflow";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await assertStudioBetaApiAccess();

    return createStudioLazyReelJsonResponse(
      await runStudioLazyReelWorkflow(
        await readStudioLazyReelWorkflowRunRequest(request),
      ),
    );
  } catch (error) {
    return createStudioLazyReelErrorResponse(error);
  }
}
