import { v } from "convex/values";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { syncStitchrHookOptionsFromPlan } from "./stitchrHookOptions/syncStitchrHookOptionsFromPlan";
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
  stitchId: v.optional(v.string()),
  ugcClipId: v.optional(v.string()),
  ugcClipName: v.optional(v.string()),
});

const manualHookPlanPayloadValidator = v.object({
  caption: v.optional(v.string()),
  demoClipId: v.optional(v.string()),
  demoClipName: v.optional(v.string()),
  hashtags: v.array(v.string()),
  hookOptions: v.array(stitchrHookVariantValidator),
  id: v.string(),
  productId: v.optional(v.string()),
  productName: v.optional(v.string()),
  selectedHook: v.string(),
  socialCaption: v.optional(v.string()),
  stitchId: v.optional(v.string()),
  ugcClipId: v.optional(v.string()),
  ugcClipName: v.optional(v.string()),
});

type HookOptionInput = {
  acceptedAt?: string;
  angle: string;
  feedbackStatus?: "accepted" | "rejected";
  reason: string;
  rejectedAt?: string;
  rejectionReason?: string;
  text: string;
};

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
  hookOptions: HookOptionInput[],
) {
  const selectedOption = hookOptions.find(
    (option) => getHookTextKey(option.text) === getHookTextKey(selectedHook),
  );
  const normalizedOptions = [
    {
      angle: selectedOption?.angle || hookOptions[0]?.angle || "Best fit",
      reason:
        selectedOption?.reason ||
        hookOptions[0]?.reason ||
        "Matches the selected clips.",
      text: selectedHook,
      ...getHookOptionFeedbackFields(selectedOption),
    },
    ...hookOptions,
  ]
    .map((option) => ({
      ...getHookOptionFeedbackFields(option),
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

function getHookOptionFeedbackFields(option: HookOptionInput | undefined) {
  if (option?.feedbackStatus === "accepted") {
    return {
      ...(option.acceptedAt ? { acceptedAt: option.acceptedAt } : {}),
      feedbackStatus: "accepted" as const,
    };
  }

  if (option?.feedbackStatus === "rejected") {
    return {
      feedbackStatus: "rejected" as const,
      ...(option.rejectedAt ? { rejectedAt: option.rejectedAt } : {}),
      ...(normalizeText(option.rejectionReason, HOOK_REASON_MAX_LENGTH)
        ? {
            rejectionReason: normalizeText(
              option.rejectionReason,
              HOOK_REASON_MAX_LENGTH,
            ),
          }
        : {}),
    };
  }

  return {};
}

function getHookTextKey(value: string | undefined) {
  return value?.trim().replace(/\s+/g, " ").toLowerCase() ?? "";
}

function getHookOptionByText(
  hookOptions: HookOptionInput[],
  hookText: string,
) {
  const hookTextKey = getHookTextKey(hookText);

  return hookOptions.find((option) => getHookTextKey(option.text) === hookTextKey);
}

function getTargetHookOption(
  hookOptions: HookOptionInput[],
  selectedHook: string,
  hookText: string | undefined,
) {
  return (
    getHookOptionByText(hookOptions, hookText ?? selectedHook) ??
    getHookOptionByText(hookOptions, selectedHook)
  );
}

function getPlanFeedbackStatusForHookText({
  currentFeedbackStatus,
  hookText,
  selectedHook,
  status,
}: {
  currentFeedbackStatus?: "accepted" | "rejected";
  hookText: string;
  selectedHook: string;
  status: "accepted" | "rejected";
}) {
  return getHookTextKey(hookText) === getHookTextKey(selectedHook)
    ? status
    : currentFeedbackStatus;
}

function updateHookOptionsFeedback({
  hookOptions,
  hookText,
  rejectionReason,
  status,
  updatedAt,
}: {
  hookOptions: HookOptionInput[];
  hookText: string;
  rejectionReason?: string;
  status: "accepted" | "rejected";
  updatedAt: string;
}) {
  const hookTextKey = getHookTextKey(hookText);

  return hookOptions.map((option) => {
    if (getHookTextKey(option.text) !== hookTextKey) {
      return option;
    }

    const {
      acceptedAt: _acceptedAt,
      rejectedAt: _rejectedAt,
      rejectionReason: _rejectionReason,
      ...optionWithoutFeedbackDates
    } = option;

    void _acceptedAt;
    void _rejectedAt;
    void _rejectionReason;

    return status === "accepted"
      ? {
          ...optionWithoutFeedbackDates,
          acceptedAt: updatedAt,
          feedbackStatus: status,
        }
      : {
          ...optionWithoutFeedbackDates,
          feedbackStatus: status,
          rejectedAt: updatedAt,
          ...(rejectionReason ? { rejectionReason } : {}),
        };
  });
}

async function addProductHookExample({
  ctx,
  hookText,
  ownerId,
  productId,
  status,
  updatedAt,
}: {
  ctx: MutationCtx;
  hookText: string;
  ownerId: string;
  productId?: string;
  status: "accepted" | "rejected";
  updatedAt: string;
}) {
  if (!productId || !hookText.trim()) {
    return;
  }

  const product = await ctx.db
    .query("products")
    .withIndex("by_owner_id", (q) =>
      q.eq("ownerId", ownerId).eq("id", productId),
    )
    .unique();

  if (!product) {
    return;
  }

  await ctx.db.patch(product._id, {
    ...(status === "accepted"
      ? {
          winningHookExamples: normalizeProductHookExamples([
            hookText,
            ...(product.winningHookExamples ?? []),
          ]),
        }
      : {
          rejectedHookExamples: normalizeProductHookExamples([
            hookText,
            ...(product.rejectedHookExamples ?? []),
          ]),
        }),
    updatedAt,
  });
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
        stitchId: normalizeText(plan.stitchId ?? `${automationTaskId}:stitch`, 160),
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

      await syncStitchrHookOptionsFromPlan({
        createdAt: existingPlan?.createdAt ?? updatedAt,
        ctx,
        hookOptions,
        ownerId,
        planCreatedAt: existingPlan?.createdAt ?? updatedAt,
        planId: existingPlan?.id ?? createPlanId(ownerId, automationTaskId),
        planSource: fields.source,
        productId: fields.productId,
        productName: fields.productName,
        selectedHook,
        stitchId: fields.stitchId,
        updatedAt,
      });

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
        stitchId: normalizeText(`${automationTaskId}:stitch`, 160),
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

      await syncStitchrHookOptionsFromPlan({
        createdAt: existingPlan?.createdAt ?? updatedAt,
        ctx,
        hookOptions: [],
        ownerId,
        planCreatedAt: existingPlan?.createdAt ?? updatedAt,
        planId: existingPlan?.id ?? createPlanId(ownerId, automationTaskId),
        planSource: fields.source,
        selectedHook: "",
        stitchId: fields.stitchId,
        updatedAt,
      });

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
      stitchId: normalizeText(plan.stitchId, 160),
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
      await syncStitchrHookOptionsFromPlan({
        createdAt: existingPlan.createdAt,
        ctx,
        hookOptions,
        ownerId,
        planCreatedAt: existingPlan.createdAt,
        planId: existingPlan.id,
        planSource: fields.source,
        productId: fields.productId,
        productName: fields.productName,
        selectedHook,
        stitchId: fields.stitchId,
        updatedAt,
      });
      return existingPlan.id;
    }

    const planId = createPlanId(ownerId, automationTaskId);
    await ctx.db.insert("stitchrHookPlans", {
      id: planId,
      createdAt: updatedAt,
      ...fields,
    });

    await syncStitchrHookOptionsFromPlan({
      createdAt: updatedAt,
      ctx,
      hookOptions,
      ownerId,
      planCreatedAt: updatedAt,
      planId,
      planSource: fields.source,
      productId: fields.productId,
      productName: fields.productName,
      selectedHook,
      stitchId: fields.stitchId,
      updatedAt,
    });

    return planId;
  },
});

export const attachStitch = mutation({
  args: {
    id: v.string(),
    stitchId: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, stitchId, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const normalizedPlanId = normalizeRequiredText(id, 180);
    const normalizedStitchId = normalizeRequiredText(stitchId, 160);

    if (!normalizedPlanId || !normalizedStitchId) {
      throw new Error("Hook or stitch is missing.");
    }

    const [plan, stitch] = await Promise.all([
      ctx.db
        .query("stitchrHookPlans")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", normalizedPlanId),
        )
        .unique(),
      ctx.db
        .query("stitches")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", normalizedStitchId),
        )
        .unique(),
    ]);

    if (!plan) {
      throw new Error("Hook not found.");
    }

    if (!stitch) {
      throw new Error("Stitch not found.");
    }

    await ctx.db.patch(plan._id, {
      stitchId: stitch.id,
      updatedAt,
    });
    const hookOptions = await ctx.db
      .query("stitchrHookOptions")
      .withIndex("by_owner_plan_rank", (query) =>
        query.eq("ownerId", ownerId).eq("planId", plan.id),
      )
      .take(HOOK_OPTION_LIMIT);

    for (const option of hookOptions) {
      await ctx.db.patch(option._id, {
        stitchId: stitch.id,
        updatedAt,
      });
    }

    return plan.id;
  },
});

export const saveManualGeneration = mutation({
  args: {
    plan: manualHookPlanPayloadValidator,
    updatedAt: v.string(),
  },
  handler: async (ctx, { plan, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const selectedHook = normalizeRequiredText(
      plan.selectedHook,
      HOOK_TEXT_MAX_LENGTH,
    );

    if (!selectedHook) {
      throw new Error("Choose a hook before saving it.");
    }

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

    const productId = normalizeText(plan.productId, 160);
    const product = productId
      ? await ctx.db
          .query("products")
          .withIndex("by_owner_id", (q) =>
            q.eq("ownerId", ownerId).eq("id", productId),
          )
          .unique()
      : null;
    const ugcClipId = normalizeText(plan.ugcClipId, 160);
    const demoClipId = normalizeText(plan.demoClipId, 160);
    const [ugcClip, demoClip] = await Promise.all([
      ugcClipId
        ? ctx.db
            .query("videoClips")
            .withIndex("by_owner_id", (q) =>
              q.eq("ownerId", ownerId).eq("id", ugcClipId),
            )
            .unique()
        : Promise.resolve(null),
      demoClipId
        ? ctx.db
            .query("videoClips")
            .withIndex("by_owner_id", (q) =>
              q.eq("ownerId", ownerId).eq("id", demoClipId),
            )
            .unique()
        : Promise.resolve(null),
    ]);
    const hookOptions = normalizeHookOptions(selectedHook, plan.hookOptions);
    const id = normalizeRequiredText(plan.id, 180);

    if (!id) {
      throw new Error("Hook save is missing an id.");
    }

    const existingPlan = await ctx.db
      .query("stitchrHookPlans")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();
    const fields = {
      ownerId,
      productId: product?.id,
      productName: normalizeText(product?.name ?? plan.productName, 160),
      stitchId: normalizeText(plan.stitchId, 160),
      ugcClipId: ugcClip?.id,
      ugcClipName: normalizeText(ugcClip?.name ?? plan.ugcClipName, 180),
      demoClipId: demoClip?.id,
      demoClipName: normalizeText(demoClip?.name ?? plan.demoClipName, 180),
      status: "planned" as const,
      source: "manual" as const,
      selectedHook,
      hookOptions,
      caption: normalizeText(plan.caption, HOOK_TEXT_MAX_LENGTH),
      hashtags: normalizeHashtags(plan.hashtags),
      socialCaption: plan.socialCaption?.trim().slice(0, 2000) || undefined,
      angle: normalizeText(hookOptions[0]?.angle, 90),
      reason: normalizeText(hookOptions[0]?.reason, HOOK_REASON_MAX_LENGTH),
      updatedAt,
    };

    if (existingPlan) {
      await ctx.db.patch(existingPlan._id, fields);
      await syncStitchrHookOptionsFromPlan({
        createdAt: existingPlan.createdAt,
        ctx,
        hookOptions,
        ownerId,
        planCreatedAt: existingPlan.createdAt,
        planId: existingPlan.id,
        planSource: fields.source,
        productId: fields.productId,
        productName: fields.productName,
        selectedHook,
        stitchId: fields.stitchId,
        updatedAt,
      });
      return existingPlan.id;
    }

    await ctx.db.insert("stitchrHookPlans", {
      id,
      createdAt: updatedAt,
      ...fields,
    });

    await syncStitchrHookOptionsFromPlan({
      createdAt: updatedAt,
      ctx,
      hookOptions,
      ownerId,
      planCreatedAt: updatedAt,
      planId: id,
      planSource: fields.source,
      productId: fields.productId,
      productName: fields.productName,
      selectedHook,
      stitchId: fields.stitchId,
      updatedAt,
    });

    return id;
  },
});

export const selectOption = mutation({
  args: {
    hookText: v.string(),
    id: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { hookText, id, updatedAt }) => {
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

    const selectedOption = getTargetHookOption(
      plan.hookOptions,
      plan.selectedHook,
      hookText,
    );
    const selectedHook = normalizeRequiredText(
      selectedOption?.text ?? hookText,
      HOOK_TEXT_MAX_LENGTH,
    );

    if (!selectedHook) {
      throw new Error("Choose a hook before saving it.");
    }

    await ctx.db.patch(plan._id, {
      acceptedAt:
        selectedOption?.feedbackStatus === "accepted"
          ? (selectedOption.acceptedAt ?? updatedAt)
          : undefined,
      angle: normalizeText(selectedOption?.angle, 90),
      feedbackStatus: selectedOption?.feedbackStatus,
      reason: normalizeText(selectedOption?.reason, HOOK_REASON_MAX_LENGTH),
      rejectedAt:
        selectedOption?.feedbackStatus === "rejected"
          ? (selectedOption.rejectedAt ?? updatedAt)
          : undefined,
      rejectionReason:
        selectedOption?.feedbackStatus === "rejected"
          ? selectedOption.rejectionReason
          : undefined,
      selectedHook,
      updatedAt,
    });

    await syncStitchrHookOptionsFromPlan({
      createdAt: plan.createdAt,
      ctx,
      hookOptions: plan.hookOptions,
      ownerId,
      planCreatedAt: plan.createdAt,
      planId: plan.id,
      planSource: plan.source,
      productId: plan.productId,
      productName: plan.productName,
      selectedHook,
      stitchId: plan.stitchId,
      updatedAt,
    });

    return plan.id;
  },
});

export const accept = mutation({
  args: {
    hookText: v.optional(v.string()),
    id: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { hookText, id, updatedAt }) => {
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

    const targetOption = getTargetHookOption(
      plan.hookOptions,
      plan.selectedHook,
      hookText,
    );
    const acceptedHook = normalizeRequiredText(
      targetOption?.text ?? hookText ?? plan.selectedHook,
      HOOK_TEXT_MAX_LENGTH,
    );
    const hookOptions = updateHookOptionsFeedback({
      hookOptions: plan.hookOptions,
      hookText: acceptedHook,
      status: "accepted",
      updatedAt,
    });
    const isSelectedHook =
      getHookTextKey(acceptedHook) === getHookTextKey(plan.selectedHook);

    await ctx.db.patch(plan._id, {
      feedbackStatus: getPlanFeedbackStatusForHookText({
        currentFeedbackStatus: plan.feedbackStatus,
        hookText: acceptedHook,
        selectedHook: plan.selectedHook,
        status: "accepted",
      }),
      hookOptions,
      ...(isSelectedHook
        ? {
            acceptedAt: updatedAt,
            rejectedAt: undefined,
            rejectionReason: undefined,
          }
        : {}),
      updatedAt,
    });

    await syncStitchrHookOptionsFromPlan({
      createdAt: plan.createdAt,
      ctx,
      hookOptions,
      ownerId,
      planCreatedAt: plan.createdAt,
      planId: plan.id,
      planSource: plan.source,
      productId: plan.productId,
      productName: plan.productName,
      selectedHook: plan.selectedHook,
      stitchId: plan.stitchId,
      updatedAt,
    });

    await addProductHookExample({
      ctx,
      hookText: acceptedHook,
      ownerId,
      productId: plan.productId,
      status: "accepted",
      updatedAt,
    });

    return plan.id;
  },
});

export const reject = mutation({
  args: {
    hookText: v.optional(v.string()),
    id: v.string(),
    reason: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (ctx, { hookText, id, reason, updatedAt }) => {
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
    const targetOption = getTargetHookOption(
      plan.hookOptions,
      plan.selectedHook,
      hookText,
    );
    const rejectedHook = normalizeRequiredText(
      targetOption?.text ?? hookText ?? plan.selectedHook,
      HOOK_TEXT_MAX_LENGTH,
    );
    const hookOptions = updateHookOptionsFeedback({
      hookOptions: plan.hookOptions,
      hookText: rejectedHook,
      rejectionReason,
      status: "rejected",
      updatedAt,
    });
    const isSelectedHook =
      getHookTextKey(rejectedHook) === getHookTextKey(plan.selectedHook);

    await ctx.db.patch(plan._id, {
      feedbackStatus: getPlanFeedbackStatusForHookText({
        currentFeedbackStatus: plan.feedbackStatus,
        hookText: rejectedHook,
        selectedHook: plan.selectedHook,
        status: "rejected",
      }),
      hookOptions,
      ...(isSelectedHook
        ? {
            acceptedAt: undefined,
            rejectedAt: updatedAt,
            rejectionReason,
          }
        : {}),
      updatedAt,
    });

    await syncStitchrHookOptionsFromPlan({
      createdAt: plan.createdAt,
      ctx,
      hookOptions,
      ownerId,
      planCreatedAt: plan.createdAt,
      planId: plan.id,
      planSource: plan.source,
      productId: plan.productId,
      productName: plan.productName,
      selectedHook: plan.selectedHook,
      stitchId: plan.stitchId,
      updatedAt,
    });

    await addProductHookExample({
      ctx,
      hookText: rejectedHook,
      ownerId,
      productId: plan.productId,
      status: "rejected",
      updatedAt,
    });

    return plan.id;
  },
});
