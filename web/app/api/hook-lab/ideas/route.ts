import { createHookLabIdeaRoute } from "./createHookLabIdeaRoute";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return await createHookLabIdeaRoute(request);
}
