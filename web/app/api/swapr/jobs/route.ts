import { NextResponse } from "next/server";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";

export const runtime = "nodejs";

export async function POST(_request?: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  return NextResponse.json(
    {
      message:
        "This older Swapr route has moved. Start Swapr from the dashboard so your plan allowance and queue priority are applied.",
    },
    { status: 410 },
  );
}
