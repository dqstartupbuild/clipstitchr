import { NextRequest, NextResponse } from "next/server";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const outputUrl = request.nextUrl.searchParams.get("url");
    const response = await fetchReplicateOutput(outputUrl ?? "");
    const responseHeaders = new Headers();
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    if (contentLength) {
      responseHeaders.set("content-length", contentLength);
    }

    return new NextResponse(response.body, { headers: responseHeaders });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to download Swapr output.",
      },
      { status: 500 },
    );
  }
}
