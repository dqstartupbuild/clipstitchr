import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";

export async function getStudioClipsAuthenticatedClient() {
  const access = await assertStudioBetaApiAccess();
  const token = await getAuthenticatedConvexToken();
  if (!token) throw new Error("Unable to verify this Studio Clips request.");
  return { ...access, convex: createAuthenticatedConvexHttpClient(token) };
}
