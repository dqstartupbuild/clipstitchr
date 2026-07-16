import { NextResponse } from "next/server";
import { getIsAuthorizedAutomationRequest } from "@/lib/clipstitchr/server/automation/getIsAuthorizedAutomationRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!getIsAuthorizedAutomationRequest(request)) {
    return NextResponse.json(
      { message: "Unauthorized Swapr finalization request." },
      { status: 401 },
    );
  }

  return NextResponse.json(
    {
      message:
        "Swapr finalization now runs through the plan-aware provider and media queues.",
    },
    { status: 410 },
  );
}
