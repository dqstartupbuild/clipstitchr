import { NextResponse } from "next/server";
import { getIsAuthorizedAutomationRequest } from "@/lib/clipstitchr/server/automation/getIsAuthorizedAutomationRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!getIsAuthorizedAutomationRequest(request)) {
    return NextResponse.json(
      { message: "Unauthorized Clipr automation request." },
      { status: 401 },
    );
  }

  return NextResponse.json(
    {
      message:
        "Clipr automation now runs through the plan-aware provider queue.",
    },
    { status: 410 },
  );
}
