import { assertStudioBetaApiAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaApiAccess";
import { createStudioBetaApiAccessErrorResponse } from "@/lib/clipstitchr/server/studio/access/createStudioBetaApiAccessErrorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await assertStudioBetaApiAccess();

    return Response.json(
      { access: "granted" },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const accessErrorResponse = createStudioBetaApiAccessErrorResponse(error);

    if (accessErrorResponse) {
      return accessErrorResponse;
    }

    return Response.json(
      { error: "Unable to verify Studio Beta access." },
      {
        headers: { "Cache-Control": "private, no-store" },
        status: 500,
      },
    );
  }
}
