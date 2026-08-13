import { api } from "@/convex/_generated/api";
import { createStudioClipsErrorResponse } from "../_lib/createStudioClipsErrorResponse";
import { createStudioClipsPrivateJsonResponse } from "../_lib/createStudioClipsPrivateJsonResponse";
import { getStudioClipsAuthenticatedClient } from "../_lib/getStudioClipsAuthenticatedClient";
import { getStudioClipsCapabilities } from "../_lib/getStudioClipsCapabilities";
import { readStudioClipsProductId } from "../_lib/readStudioClipsProductId";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const productId = readStudioClipsProductId(request);
    const { convex } = await getStudioClipsAuthenticatedClient();
    await convex.mutation(
      api.studioClipsRateLimits.reserveStaticRead.reserveStaticRead,
      { productId },
    );
    const execution = await convex.query(
      api.studioClipsTasks.getCapabilities.getCapabilities,
      { productId },
    );
    return createStudioClipsPrivateJsonResponse(
      getStudioClipsCapabilities(productId, execution),
    );
  } catch (error) {
    return createStudioClipsErrorResponse(
      error,
      "Unable to load Studio Clips capabilities.",
    );
  }
}
