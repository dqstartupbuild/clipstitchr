import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";

export async function getStudioLazyReelConvexClient() {
  const token = await getAuthenticatedConvexToken();

  if (!token) {
    throw new Error("Unable to verify this Studio research request.");
  }

  return createAuthenticatedConvexHttpClient(token);
}
