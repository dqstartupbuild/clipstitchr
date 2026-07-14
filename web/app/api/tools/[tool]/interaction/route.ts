import { isPublicToolKey } from "@/lib/clipstitchr/tools/catalog/isPublicToolKey";
import { handlePublicToolInteractionRequest } from "@/lib/clipstitchr/tools/publicToolGates/server/handlePublicToolInteractionRequest";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ tool: string }> },
) {
  const { tool } = await context.params;

  if (!isPublicToolKey(tool)) {
    return Response.json(
      { message: "Tool not found." },
      { headers: { "Cache-Control": "private, no-store" }, status: 404 },
    );
  }

  return await handlePublicToolInteractionRequest(request, tool);
}
