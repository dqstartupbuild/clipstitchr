import "server-only";

import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";

export async function getStudioStitchConvexClient() {
  const token = await getAuthenticatedConvexToken();
  if (!token) {
    throw new Error("Unable to verify this Studio Stitch request.");
  }

  return createAuthenticatedConvexHttpClient(token);
}
