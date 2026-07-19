import { createHookLabPostRoute } from "./createHookLabPostRoute";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return await createHookLabPostRoute(request);
}
