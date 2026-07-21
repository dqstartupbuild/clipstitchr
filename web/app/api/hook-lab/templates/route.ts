import { getHookLibraryTemplatesRoute } from "./getHookLibraryTemplatesRoute";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return await getHookLibraryTemplatesRoute(request);
}
