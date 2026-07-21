import { createHookLabCreativeBriefRoute } from "./createHookLabCreativeBriefRoute";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return await createHookLabCreativeBriefRoute(request);
}
