import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { coreAutomationTools } from "@/lib/clipstitchr/constants/coreAutomationTools";
import type { AutomationTool } from "@/lib/clipstitchr/types/AutomationTool";
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

type PlannerPreference = {
  enabledTools: AutomationTool[];
  ownerId: string;
};

async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return {};
  }

  return (await request.json()) as AutomationPlanRequestBody;
}

function getResultKey(tool: AutomationTool) {
  return tool === "avatar-photo" ? "avatarPhoto" : tool;
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
    const plannerPreferences: PlannerPreference[] = body.ownerId
      ? [
          await convex.query(
            api.automationPlannerCandidates.getEnabledToolsForOwner,
            {
              secret,
              ownerId: body.ownerId,
            },
          ),
        ]
      : (
          await convex.query(api.automationPlannerCandidates.listEnabled, {
            secret,
            limit: body.limit ?? 100,
          })
        ).preferences;
    const enabledPlannerPreferences = plannerPreferences.filter(
      (preference) => preference.enabledTools.length > 0,
    );
    const results = [];
    const plannedToolSet = new Set<AutomationTool>();

    for (const preference of enabledPlannerPreferences) {
      const ownerId = preference.ownerId;
      const entries = await Promise.all(
        preference.enabledTools.map(async (tool) => {
          if (tool === "stitchr") {
            return [
              tool,
              await convex.mutation(api.automationStitchr.planDaily, {
                secret,
                ownerId,
                automationDate,
                now,
              }),
            ] as const;
          }

          if (tool === "swapr") {
            return [
              tool,
              await convex.mutation(api.automationSwapr.planDaily, {
                secret,
                ownerId,
                automationDate,
                now,
              }),
            ] as const;
          }

          if (tool === "clipr") {
            return [
              tool,
              await convex.mutation(api.automationClipr.planDaily, {
                secret,
                ownerId,
                automationDate,
                now,
              }),
            ] as const;
          }

          if (tool === "avatar-photo") {
            return [
              tool,
              await convex.mutation(api.automationAvatarPhoto.planDaily, {
                secret,
                ownerId,
                automationDate,
                now,
              }),
            ] as const;
          }

          return [
            tool,
            await convex.mutation(api.automationSwipr.planDaily, {
              secret,
              ownerId,
              automationDate,
              now,
            }),
          ] as const;
        }),
      );
      const result: Record<string, unknown> = { ownerId };

      for (const [tool, output] of entries) {
        result[getResultKey(tool)] = output;
        plannedToolSet.add(tool);
      }

      results.push(result);
    }

    return NextResponse.json({
      automationDate,
      heldTools: [],
      ownerCount: enabledPlannerPreferences.length,
      plannedTools: coreAutomationTools.filter((tool) => plannedToolSet.has(tool)),
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
