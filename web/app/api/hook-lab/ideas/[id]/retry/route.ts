import { retryHookLabIdeaRoute } from "./retryHookLabIdeaRoute";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  return await retryHookLabIdeaRoute(request, id);
}
