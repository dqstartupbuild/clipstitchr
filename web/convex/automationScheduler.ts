import { v } from "convex/values";
import { api } from "./_generated/api";
import { internalAction } from "./_generated/server";

const DEFAULT_OWNER_LIMIT = 100;
const DEFAULT_SWAPR_START_LIMIT = 3;
const DEFAULT_SWAPR_FINALIZE_LIMIT = 8;
const DEFAULT_CLIPR_START_LIMIT = 1;
const MAX_ROUTE_LOOP_LIMIT = 25;

type RouteLoopResult = {
  attempts: number;
  claimed: number;
  errors: string[];
  path: string;
};

type PlannerCandidatesResult = {
  preferences: Array<{
    ownerId: string;
  }>;
};

type CorePlannerResult = {
  automationDate: string;
  heldTools: string[];
  ownerCount: number;
  plannedTools: string[];
  results: Array<{
    clipr: unknown;
    ownerId: string;
    stitchr: unknown;
    swapr: unknown;
  }>;
};

type CoreProviderDispatchResult = {
  now: string;
  routes: {
    cliprExecute: RouteLoopResult;
    swaprExecute: RouteLoopResult;
    swaprFinalize: RouteLoopResult;
  };
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

function getAutomationBaseUrl() {
  const rawValue =
    process.env.AUTOMATION_NEXT_BASE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL;
  const value = rawValue?.trim();

  if (!value) {
    throw new Error("Missing AUTOMATION_NEXT_BASE_URL.");
  }

  const withProtocol = /^https?:\/\//i.test(value)
    ? value
    : `https://${value}`;

  return new URL(withProtocol);
}

function getTaskFromResponse(value: unknown) {
  if (!value || typeof value !== "object" || !("task" in value)) {
    return undefined;
  }

  return (value as { task?: unknown }).task;
}

async function postAutomationRoute({
  baseUrl,
  body,
  path,
  secret,
}: {
  baseUrl: URL;
  body: Record<string, unknown>;
  path: string;
  secret: string;
}) {
  const url = new URL(path, baseUrl);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-automation-worker-secret": secret,
    },
    body: JSON.stringify(body),
  });
  const responseBody = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const message =
      responseBody &&
      typeof responseBody === "object" &&
      "message" in responseBody &&
      typeof responseBody.message === "string"
        ? responseBody.message
        : `Automation route ${path} failed with ${response.status}.`;

    throw new Error(message);
  }

  return responseBody;
}

async function runRouteLoop({
  baseUrl,
  limit,
  now,
  path,
  secret,
  workerId,
}: {
  baseUrl: URL;
  limit: number;
  now: string;
  path: string;
  secret: string;
  workerId: string;
}): Promise<RouteLoopResult> {
  const result: RouteLoopResult = {
    attempts: 0,
    claimed: 0,
    errors: [],
    path,
  };

  for (let index = 0; index < limit; index += 1) {
    try {
      const body = await postAutomationRoute({
        baseUrl,
        body: {
          now,
          workerId: `${workerId}-${index + 1}`,
        },
        path,
        secret,
      });
      const task = getTaskFromResponse(body);

      result.attempts += 1;

      if (!task) {
        break;
      }

      result.claimed += 1;
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : "Automation route failed.",
      );
      break;
    }
  }

  return result;
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
      ? null
      : ((await ctx.runQuery(api.automationPlannerCandidates.listEnabled, {
            secret,
            limit: getPositiveInteger(
              args.limit,
              DEFAULT_OWNER_LIMIT,
              DEFAULT_OWNER_LIMIT,
            ),
          })) as PlannerCandidatesResult);
    const ownerIds: string[] = args.ownerId
      ? [args.ownerId]
      : candidates?.preferences.map((preference) => preference.ownerId) ?? [];
    const results: CorePlannerResult["results"] = [];

    for (const ownerId of ownerIds) {
      const outputs = await Promise.all([
        ctx.runMutation(api.automationStitchr.planDaily, {
          secret,
          ownerId,
          automationDate,
          now,
        }),
        ctx.runMutation(api.automationSwapr.planDaily, {
          secret,
          ownerId,
          automationDate,
          now,
        }),
        ctx.runMutation(api.automationClipr.planDaily, {
          secret,
          ownerId,
          automationDate,
          now,
        }),
      ]);
      const [stitchr, swapr, clipr] = outputs as [unknown, unknown, unknown];

      results.push({
        ownerId,
        stitchr,
        swapr,
        clipr,
      });
    }

    return {
      automationDate,
      ownerCount: ownerIds.length,
      plannedTools: ["stitchr", "swapr", "clipr"],
      heldTools: ["avatar-photo", "swipr"],
      results,
    };
  },
});

export const dispatchCoreProviders = internalAction({
  args: {
    maxCliprStarts: v.optional(v.number()),
    maxSwaprFinalizations: v.optional(v.number()),
    maxSwaprStarts: v.optional(v.number()),
    now: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<CoreProviderDispatchResult> => {
    const now = getNow(args.now);
    const secret = getRequiredEnv("AUTOMATION_WORKER_SECRET");
    const baseUrl = getAutomationBaseUrl();
    const [swaprExecute, swaprFinalize, cliprExecute] = await Promise.all([
      runRouteLoop({
        baseUrl,
        limit: getPositiveInteger(
          args.maxSwaprStarts,
          DEFAULT_SWAPR_START_LIMIT,
          MAX_ROUTE_LOOP_LIMIT,
        ),
        now,
        path: "/api/automation/swapr/execute",
        secret,
        workerId: "convex-swapr-execute",
      }),
      runRouteLoop({
        baseUrl,
        limit: getPositiveInteger(
          args.maxSwaprFinalizations,
          DEFAULT_SWAPR_FINALIZE_LIMIT,
          MAX_ROUTE_LOOP_LIMIT,
        ),
        now,
        path: "/api/automation/swapr/finalize",
        secret,
        workerId: "convex-swapr-finalize",
      }),
      runRouteLoop({
        baseUrl,
        limit: getPositiveInteger(
          args.maxCliprStarts,
          DEFAULT_CLIPR_START_LIMIT,
          MAX_ROUTE_LOOP_LIMIT,
        ),
        now,
        path: "/api/automation/clipr/execute",
        secret,
        workerId: "convex-clipr-execute",
      }),
    ]);

    return {
      now,
      routes: {
        swaprExecute,
        swaprFinalize,
        cliprExecute,
      },
    };
  },
});
