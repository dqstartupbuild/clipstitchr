import { v } from "convex/values";
import { api } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { coreAutomationTools } from "../lib/clipstitchr/constants/coreAutomationTools";
import type { AutomationTool } from "../lib/clipstitchr/types/AutomationTool";

const DEFAULT_OWNER_LIMIT = 100;

type PlannerCandidatesResult = {
  preferences: Array<{
    enabledTools: AutomationTool[];
    ownerId: string;
  }>;
};

type CorePlannerResult = {
  automationDate: string;
  heldTools: string[];
  ownerCount: number;
  plannedTools: string[];
  results: Array<{
    avatarPhoto?: unknown;
    clipr?: unknown;
    ownerId: string;
    stitchr?: unknown;
    swapr?: unknown;
    swipr?: unknown;
  }>;
};

type CoreProviderDispatchResult = {
  message: string;
  now: string;
  providerWorker: "external";
};

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

function getNow(value: string | undefined) {
  if (value && Number.isFinite(Date.parse(value))) {
    return value;
  }

  return new Date().toISOString();
}

function getAutomationDate(now: string) {
  const timestamp = Date.parse(now);

  if (!Number.isFinite(timestamp)) {
    throw new Error("Automation date requires a valid timestamp.");
  }

  return new Date(timestamp).toISOString().slice(0, 10);
}

function getResultKey(tool: AutomationTool) {
  return tool === "avatar-photo" ? "avatarPhoto" : tool;
}

function getPositiveInteger(
  value: number | undefined,
  fallback: number,
  max: number,
) {
  if (!Number.isFinite(value) || value === undefined) {
    return fallback;
  }

  return Math.max(1, Math.min(max, Math.floor(value)));
}

export const planCoreDaily = internalAction({
  args: {
    automationDate: v.optional(v.string()),
    limit: v.optional(v.number()),
    now: v.optional(v.string()),
    ownerId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<CorePlannerResult> => {
    const now = getNow(args.now);
    const automationDate = args.automationDate ?? getAutomationDate(now);
    const secret = getRequiredEnv("AUTOMATION_WORKER_SECRET");
    const candidates = args.ownerId
      ? ({
          preferences: [
            (await ctx.runQuery(
              api.automationPlannerCandidates.getEnabledToolsForOwner,
              {
                secret,
                ownerId: args.ownerId,
              },
            )) as PlannerCandidatesResult["preferences"][number],
          ],
        } satisfies PlannerCandidatesResult)
      : ((await ctx.runQuery(api.automationPlannerCandidates.listEnabled, {
            secret,
            limit: getPositiveInteger(
              args.limit,
              DEFAULT_OWNER_LIMIT,
              DEFAULT_OWNER_LIMIT,
            ),
          })) as PlannerCandidatesResult);
    const ownerPreferences = candidates.preferences.filter(
      (preference) => preference.enabledTools.length > 0,
    );
    const results: CorePlannerResult["results"] = [];
    const plannedToolSet = new Set<AutomationTool>();

    for (const preference of ownerPreferences) {
      const ownerId = preference.ownerId;
      const entries = await Promise.all(
        preference.enabledTools.map(async (tool) => {
          if (tool === "stitchr") {
            return [
              tool,
              await ctx.runMutation(api.automationStitchr.planDaily, {
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
              await ctx.runMutation(api.automationSwapr.planDaily, {
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
              await ctx.runMutation(api.automationClipr.planDaily, {
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
              await ctx.runMutation(api.automationAvatarPhoto.planDaily, {
                secret,
                ownerId,
                automationDate,
                now,
              }),
            ] as const;
          }

          return [
            tool,
            await ctx.runMutation(api.automationSwipr.planDaily, {
              secret,
              ownerId,
              automationDate,
              now,
            }),
          ] as const;
        }),
      );
      const result: CorePlannerResult["results"][number] = { ownerId };

      for (const [tool, output] of entries) {
        result[getResultKey(tool)] = output;
        plannedToolSet.add(tool);
      }

      results.push(result);
    }

    return {
      automationDate,
      ownerCount: ownerPreferences.length,
      plannedTools: coreAutomationTools.filter((tool) => plannedToolSet.has(tool)),
      heldTools: [],
      results,
    };
  },
});

export const dispatchCoreProviders = internalAction({
  args: {
    now: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<CoreProviderDispatchResult> => ({
    now: getNow(args.now),
    providerWorker: "external",
    message:
      "Provider dispatch is owned by the provider worker. Convex no longer calls protected Next.js routes.",
  }),
});
