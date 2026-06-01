import { automationDailyLimits } from "./automationLimits";
import type { MutationCtx } from "./_generated/server";

type AutomationTool = "avatar-photo" | "clipr" | "stitchr" | "swapr" | "swipr";

export async function createAutomationRun(
  ctx: MutationCtx,
  {
    automationDate,
    createdAt,
    id,
    idempotencyKey,
    inputSnapshotJson,
    ownerId,
    tool,
  }: {
    automationDate: string;
    createdAt: string;
    id: string;
    idempotencyKey: string;
    inputSnapshotJson: string;
    ownerId: string;
    tool: AutomationTool;
  },
) {
  const existing = await ctx.db
    .query("automationRuns")
    .withIndex("by_idempotency_key", (q) =>
      q.eq("idempotencyKey", idempotencyKey),
    )
    .unique();

  if (existing) {
    return existing;
  }

  const insertedId = await ctx.db.insert("automationRuns", {
    ownerId,
    id,
    automationDate,
    tool,
    status: "queued",
    idempotencyKey,
    inputSnapshotJson,
    dailyLimit: automationDailyLimits[tool],
    attempt: 0,
    createdAt,
    updatedAt: createdAt,
  });
  const inserted = await ctx.db.get(insertedId);

  if (!inserted) {
    throw new Error("Failed to create automation run.");
  }

  return inserted;
}
