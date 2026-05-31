import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getAutomationDate } from "@/lib/clipstitchr/server/automation/getAutomationDate";
import { getAutomationWorkerSecret } from "@/lib/clipstitchr/server/automation/getAutomationWorkerSecret";
import { getIsAuthorizedAutomationRequest } from "@/lib/clipstitchr/server/automation/getIsAuthorizedAutomationRequest";

export const runtime = "nodejs";

type AutomationPlanRequestBody = {
  automationDate?: string;
  limit?: number;
  now?: string;
  ownerId?: string;
};

async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return {};
  }

  return (await request.json()) as AutomationPlanRequestBody;
}

export async function POST(request: Request) {
  try {
    if (!getIsAuthorizedAutomationRequest(request)) {
      return NextResponse.json(
        { message: "Unauthorized automation planner request." },
        { status: 401 },
      );
    }

    const body = await readBody(request);
    const now = body.now ?? new Date().toISOString();
    const automationDate = body.automationDate ?? getAutomationDate(now);
    const secret = getAutomationWorkerSecret();
    const convex = createConvexHttpClient();
    const ownerIds = body.ownerId
      ? [body.ownerId]
      : (
          await convex.query(api.automationPlannerCandidates.listEnabled, {
            secret,
            limit: body.limit ?? 100,
          })
        ).preferences.map((preference) => preference.ownerId);
    const results = [];

    for (const ownerId of ownerIds) {
      const [stitchr, swapr, clipr, avatarPhoto, swipr] = await Promise.all([
        convex.mutation(api.automationStitchr.planDaily, {
          secret,
          ownerId,
          automationDate,
          now,
        }),
        convex.mutation(api.automationSwapr.planDaily, {
          secret,
          ownerId,
          automationDate,
          now,
        }),
        convex.mutation(api.automationClipr.planDaily, {
          secret,
          ownerId,
          automationDate,
          now,
        }),
        convex.mutation(api.automationAvatarPhoto.planDaily, {
          secret,
          ownerId,
          automationDate,
          now,
        }),
        convex.mutation(api.automationSwipr.planDaily, {
          secret,
          ownerId,
          automationDate,
          now,
        }),
      ]);

      results.push({
        ownerId,
        stitchr,
        swapr,
        clipr,
        avatarPhoto,
        swipr,
      });
    }

    return NextResponse.json({
      automationDate,
      ownerCount: ownerIds.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to plan automation runs.",
      },
      { status: 500 },
    );
  }
}
