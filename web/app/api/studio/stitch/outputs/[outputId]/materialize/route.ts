import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { createStudioStitchErrorResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchErrorResponse";
import { createStudioStitchJsonResponse } from "@/lib/clipstitchr/server/studio/stitch/createStudioStitchJsonResponse";
import { materializeStudioStitchOutput } from "@/lib/clipstitchr/server/studio/stitch/materializeStudioStitchOutput";
import { readStudioStitchMaterializeRequest } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchMaterializeRequest";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: {
    readonly params: Promise<{ readonly outputId: string }>;
  },
) {
  try {
    await assertStudioBetaApiAccess();
    const outputId = (await context.params).outputId.trim();
    if (!outputId || outputId.length > 120) {
      throw new Error("A valid Studio Stitch output ID is required.");
    }
    return createStudioStitchJsonResponse(
      await materializeStudioStitchOutput(
        outputId,
        await readStudioStitchMaterializeRequest(request),
      ),
    );
  } catch (error) {
    return createStudioStitchErrorResponse(error);
  }
}
