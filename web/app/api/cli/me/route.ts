import { NextResponse } from "next/server";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { getCliSessionFromRequest } from "@/lib/clipstitchr/server/cli/getCliSessionFromRequest";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getCliSessionFromRequest(request);

  if (!session) {
    return createCliAuthenticationRequiredResponse();
  }

  return NextResponse.json({ session });
}
