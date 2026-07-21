import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getRelatedHookLibraryTemplates } from "@/lib/clipstitchr/server/hookLab/getRelatedHookLibraryTemplates";

export async function getRelatedHookLabTemplatesRoute(request: Request) {
  if (!(await getAuthenticatedUserId())) {
    return createAuthenticationRequiredResponse();
  }

  const postId = new URL(request.url).searchParams.get("postId")?.trim();

  if (!postId) {
    return Response.json({ message: "Choose a completed report." }, { status: 400 });
  }

  const token = await getAuthenticatedConvexToken();

  if (!token) {
    return createAuthenticationRequiredResponse();
  }

  const post = await createAuthenticatedConvexHttpClient(token).query(
    api.hookLabPosts.get.get,
    { id: postId },
  );

  if (!post?.analysis?.formatDna || post.status !== "ready") {
    return Response.json({ items: [] });
  }

  return Response.json({
    items: getRelatedHookLibraryTemplates(post.analysis.formatDna),
  });
}
