import { v } from "convex/values";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { stitchrHookVariantValidator } from "./validators/stitchrHookVariant";

const HOOK_TEXT_MAX_LENGTH = 240;
const HOOK_REASON_MAX_LENGTH = 280;
const HOOK_OPTION_LIMIT = 8;
const HASHTAG_LIMIT = 5;
const PRODUCT_HOOK_EXAMPLE_LIMIT = 20;
const PRODUCT_HOOK_EXAMPLE_MAX_LENGTH = 180;
const LIST_LIMIT = 120;

const hookPlanPayloadValidator = v.object({
  angle: v.optional(v.string()),
  automationRunId: v.optional(v.string()),
  automationTaskId: v.string(),
  caption: v.optional(v.string()),
  demoClipId: v.optional(v.string()),
  demoClipName: v.optional(v.string()),
  hashtags: v.array(v.string()),
  hookOptions: v.array(stitchrHookVariantValidator),
  productId: v.optional(v.string()),
  productName: v.optional(v.string()),
  providerModel: v.optional(v.string()),
  providerPredictionId: v.optional(v.string()),
  reason: v.optional(v.string()),
  selectedHook: v.string(),
  socialCaption: v.optional(v.string()),
  ugcClipId: v.optional(v.string()),
  ugcClipName: v.optional(v.string()),
});

function normalizeText(value: string | undefined, maxLength: number) {
  return value?.trim().replace(/\s+/g, " ").slice(0, maxLength) || undefined;
}

function normalizeRequiredText(value: string, maxLength: number) {
  return normalizeText(value, maxLength) ?? "";
}

function normalizeHashtag(value: string) {
  const text = value
    .trim()
    .replace(/^#+/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

  return text ? `#${text}` : "";
}

function normalizeHashtags(values: string[]) {
  return Array.from(new Set(values.map(normalizeHashtag).filter(Boolean))).slice(
    0,
    HASHTAG_LIMIT,
  );
}

function normalizeHookOptions(
  selectedHook: string,
  hookOptions: Array<{
    angle: string;
    reason: string;
    text: string;
  }>,
) {
  const normalizedOptions = [
    {
      angle: hookOptions[0]?.angle || "Best fit",
      reason: hookOptions[0]?.reason || "Matches the selected clips.",
      text: selectedHook,
    },
    ...hookOptions,
  ]
    .map((option) => ({
      angle: normalizeRequiredText(option.angle, 90),
      reason: normalizeRequiredText(option.reason, HOOK_REASON_MAX_LENGTH),
      text: normalizeRequiredText(option.text, HOOK_TEXT_MAX_LENGTH),
    }))
    .filter((option) => option.text);
  const seenOptions = new Set<string>();

  return normalizedOptions
    .filter((option) => {
      const key = option.text.toLowerCase();

      if (seenOptions.has(key)) {
        return false;
      }

      seenOptions.add(key);
      return true;
    })
    .slice(0, HOOK_OPTION_LIMIT);
}

function normalizeProductHookExamples(values: string[] | undefined) {
  return Array.from(
    new Set(
      (values ?? [])
        .map((value) => normalizeRequiredText(value, PRODUCT_HOOK_EXAMPLE_MAX_LENGTH))
        .filter(Boolean),
    ),
  ).slice(0, PRODUCT_HOOK_EXAMPLE_LIMIT);
}

function createPlanId(ownerId: string, automationTaskId: string) {
  return `stitchr-hook-plan:${ownerId}:${automationTaskId}`;
}

export const listBatchPlanningInputs = query({
  args: {
    taskIds: v.array(v.string()),
  },
  handler: async (ctx, { taskIds }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const uniqueTaskIds = Array.from(new Set(taskIds.map((id) => id.trim())))
      .filter(Boolean)
      .slice(0, 20);
    const tasks = await Promise.all(
      uniqueTaskIds.map((id) =>
        ctx.db
          .query("automationTasks")
          .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
          .unique(),
      ),
    );

    return tasks
      .filter(
        (task): task is NonNullable<typeof task> =>
          Boolean(
            task?.tool === "stitchr" && task.taskType === "stitchr-draft",
          ),
      )
      .map((task) => ({
        id: task.id,
        inputSnapshotJson: task.inputSnapshotJson,
        runId: task.runId,
      }));
  },
});

export const list = query({
  args: {
    productId: v.optional(v.string()),
  },
  handler: async (ctx, { productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    if (productId?.trim()) {
      return await ctx.db
        .query("stitchrHookPlans")
        .withIndex("by_owner_product_created", (q) =>
          q.eq("ownerId", ownerId).eq("productId", productId.trim()),
        )
        .order("desc")
        .take(LIST_LIMIT);
    }

    return await ctx.db
      .query("stitchrHookPlans")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(LIST_LIMIT);
  },
});

export const getByAutomationTaskForProvider = query({
  args: {
    automationTaskId: v.string(),
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { automationTaskId, ownerId, secret }) => {
    assertProviderWorkerSecret(secret);

    return await ctx.db
      .query("stitchrHookPlans")
      .withIndex("by_owner_task", (q) =>
        q.eq("ownerId", ownerId).eq("automationTaskId", automationTaskId),
      )
      .unique();
  },
});

export const saveBatchPlannerResults = mutation({
  args: {
    plans: v.array(hookPlanPayloadValidator),
    updatedAt: v.string(),
  },
  handler: async (ctx, { plans, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const nextPlans = plans.slice(0, 20);

    if (!nextPlans.length) {
      return { savedCount: 0 };
    }

    await rateLimiter.limit(ctx, "convexRecordSave", {
      count: nextPlans.length,
      key: ownerId,
      throws: true,
    });

    let savedCount = 0;

    for (const plan of nextPlans) {
      const automationTaskId = normalizeRequiredText(plan.automationTaskId, 160);
      const selectedHook = normalizeRequiredText(
        plan.selectedHook,
        HOOK_TEXT_MAX_LENGTH,
      );

      if (!automationTaskId || !selectedHook) {
        continue;
      }

      const task = await ctx.db
        .query("automationTasks")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", automationTaskId),
        )
        .unique();

      if (!task) {
        continue;
      }

      const existingPlan = await ctx.db
        .query("stitchrHookPlans")
        .withIndex("by_owner_task", (q) =>
          q.eq("ownerId", ownerId).eq("automationTaskId", automationTaskId),
        )
        .unique();
      const hookOptions = normalizeHookOptions(selectedHook, plan.hookOptions);
      const fields = {
        ownerId,
        productId: normalizeText(plan.productId, 160),
        productName: normalizeText(plan.productName, 160),
        automationRunId: normalizeText(plan.automationRunId ?? task.runId, 220),
        automationTaskId,
        ugcClipId: normalizeText(plan.ugcClipId, 160),
        ugcClipName: normalizeText(plan.ugcClipName, 180),
        demoClipId: normalizeText(plan.demoClipId, 160),
        demoClipName: normalizeText(plan.demoClipName, 180),
        status: "planned" as const,
        source: "batch_planner" as const,
        selectedHook,
        hookOptions,
        caption: normalizeText(plan.caption, HOOK_TEXT_MAX_LENGTH),
        hashtags: normalizeHashtags(plan.hashtags),
        socialCaption: plan.socialCaption?.trim().slice(0, 2000) || undefined,
        angle: normalizeText(plan.angle ?? hookOptions[0]?.angle, 90),
        reason: normalizeText(plan.reason ?? hookOptions[0]?.reason, HOOK_REASON_MAX_LENGTH),
        providerModel: normalizeText(plan.providerModel, 160),
        providerPredictionId: normalizeText(plan.providerPredictionId, 160),
        updatedAt,
      };

      if (existingPlan) {
        await ctx.db.patch(existingPlan._id, fields);
      } else {
        await ctx.db.insert("stitchrHookPlans", {
          id: createPlanId(ownerId, automationTaskId),
          createdAt: updatedAt,
          ...fields,
        });
      }

      savedCount += 1;
    }

    return { savedCount };
  },
});

export const saveBatchPlannerFailure = mutation({
  args: {
    reason: v.string(),
    taskIds: v.array(v.string()),
    updatedAt: v.string(),
  },
  handler: async (ctx, { reason, taskIds, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const uniqueTaskIds = Array.from(new Set(taskIds.map((id) => id.trim())))
      .filter(Boolean)
      .slice(0, 20);
    const failureReason =
      normalizeText(reason, HOOK_REASON_MAX_LENGTH) ??
      "The batch hook planner did not finish.";
    let savedCount = 0;

    for (const automationTaskId of uniqueTaskIds) {
      const task = await ctx.db
        .query("automationTasks")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", automationTaskId),
        )
        .unique();

      if (!task) {
        continue;
      }

      const existingPlan = await ctx.db
        .query("stitchrHookPlans")
        .withIndex("by_owner_task", (q) =>
          q.eq("ownerId", ownerId).eq("automationTaskId", automationTaskId),
        )
        .unique();
      const fields = {
        ownerId,
        automationRunId: task.runId,
        automationTaskId,
        status: "failed" as const,
        source: "batch_planner" as const,
        selectedHook: "",
        hookOptions: [],
        hashtags: [],
        reason: failureReason,
        updatedAt,
      };

      if (existingPlan) {
        await ctx.db.patch(existingPlan._id, fields);
      } else {
        await ctx.db.insert("stitchrHookPlans", {
          id: createPlanId(ownerId, automationTaskId),
          createdAt: updatedAt,
          ...fields,
        });
      }

      savedCount += 1;
    }

    return { savedCount };
  },
});

export const saveWorkerFallbackResult = mutation({
  args: {
    ownerId: v.string(),
    plan: hookPlanPayloadValidator,
    secret: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { ownerId, plan, secret, updatedAt }) => {
    assertProviderWorkerSecret(secret);

    const automationTaskId = normalizeRequiredText(plan.automationTaskId, 160);
    const selectedHook = normalizeRequiredText(plan.selectedHook, HOOK_TEXT_MAX_LENGTH);

    if (!automationTaskId || !selectedHook) {
      return null;
    }

    const task = await ctx.db
      .query("automationTasks")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", automationTaskId),
      )
      .unique();

    if (!task) {
      return null;
    }

    const existingPlan = await ctx.db
      .query("stitchrHookPlans")
      .withIndex("by_owner_task", (q) =>
        q.eq("ownerId", ownerId).eq("automationTaskId", automationTaskId),
      )
      .unique();
    const hookOptions = normalizeHookOptions(selectedHook, plan.hookOptions);
    const fields = {
      ownerId,
      productId: normalizeText(plan.productId, 160),
      productName: normalizeText(plan.productName, 160),
      automationRunId: normalizeText(plan.automationRunId ?? task.runId, 220),
      automationTaskId,
      ugcClipId: normalizeText(plan.ugcClipId, 160),
      ugcClipName: normalizeText(plan.ugcClipName, 180),
      demoClipId: normalizeText(plan.demoClipId, 160),
      demoClipName: normalizeText(plan.demoClipName, 180),
      status: "fallback" as const,
      source: "worker_fallback" as const,
      selectedHook,
      hookOptions,
      caption: normalizeText(plan.caption, HOOK_TEXT_MAX_LENGTH),
      hashtags: normalizeHashtags(plan.hashtags),
      socialCaption: plan.socialCaption?.trim().slice(0, 2000) || undefined,
      angle: normalizeText(plan.angle ?? hookOptions[0]?.angle, 90),
      reason: normalizeText(plan.reason ?? hookOptions[0]?.reason, HOOK_REASON_MAX_LENGTH),
      providerModel: normalizeText(plan.providerModel, 160),
      providerPredictionId: normalizeText(plan.providerPredictionId, 160),
      updatedAt,
    };

    if (existingPlan) {
      await ctx.db.patch(existingPlan._id, fields);
      return existingPlan.id;
    }

    await ctx.db.insert("stitchrHookPlans", {
      id: createPlanId(ownerId, automationTaskId),
      createdAt: updatedAt,
      ...fields,
    });

    return createPlanId(ownerId, automationTaskId);
  },
});

export const accept = mutation({
  args: {
    id: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const plan = await ctx.db
      .query("stitchrHookPlans")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!plan) {
      throw new Error("Hook not found.");
    }

    await ctx.db.patch(plan._id, {
      acceptedAt: updatedAt,
      feedbackStatus: "accepted",
      rejectedAt: undefined,
      rejectionReason: undefined,
      updatedAt,
    });

    const productId = plan.productId;

    if (productId && plan.selectedHook.trim()) {
      const product = await ctx.db
        .query("products")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", productId),
        )
        .unique();

      if (product) {
        await ctx.db.patch(product._id, {
          winningHookExamples: normalizeProductHookExamples([
            plan.selectedHook,
            ...(product.winningHookExamples ?? []),
          ]),
          updatedAt,
        });
      }
    }

    return plan.id;
  },
});

export const reject = mutation({
  args: {
    id: v.string(),
    reason: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, reason, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const plan = await ctx.db
      .query("stitchrHookPlans")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!plan) {
      throw new Error("Hook not found.");
    }

    const rejectionReason = normalizeText(reason, HOOK_REASON_MAX_LENGTH);

    await ctx.db.patch(plan._id, {
      acceptedAt: undefined,
      feedbackStatus: "rejected",
      rejectedAt: updatedAt,
      rejectionReason,
      updatedAt,
    });

    const productId = plan.productId;

    if (productId && plan.selectedHook.trim()) {
      const product = await ctx.db
        .query("products")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", productId),
        )
        .unique();

      if (product) {
        await ctx.db.patch(product._id, {
          rejectedHookExamples: normalizeProductHookExamples([
            plan.selectedHook,
            ...(product.rejectedHookExamples ?? []),
          ]),
          updatedAt,
        });
      }
    }

    return plan.id;
  },
});
