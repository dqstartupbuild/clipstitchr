import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { listHookLibraryTemplates } from "@/lib/clipstitchr/server/hookLibrary/listHookLibraryTemplates";
import { readHookLibraryQuery } from "@/lib/clipstitchr/server/hookLibrary/readHookLibraryQuery";

export async function getHookLibraryTemplatesRoute(request: Request) {
  if (!(await getAuthenticatedUserId())) {
    return createAuthenticationRequiredResponse();
  }

  return Response.json(listHookLibraryTemplates(readHookLibraryQuery(request.url)), {
    headers: { "cache-control": "private, max-age=60" },
  });
}
