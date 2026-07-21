import { getRelatedHookLabTemplatesRoute } from "./getRelatedHookLabTemplatesRoute";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return await getRelatedHookLabTemplatesRoute(request);
}
