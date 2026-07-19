import { retryHookLabPostRoute } from "./retryHookLabPostRoute";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  return await retryHookLabPostRoute(request, id);
}
