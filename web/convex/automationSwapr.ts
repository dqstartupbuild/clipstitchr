import { v } from "convex/values";
import { consumeAutomationBudget } from "./automationBudget";
import { createAutomationRun } from "./automationCreateRun";
import { createAutomationTask } from "./automationCreateTask";
import { markAutomationRunSkipped } from "./automationMarkRunSkipped";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { mutation } from "./_generated/server";
import { isWithinAutomationGlobalWindow } from "./isWithinAutomationGlobalWindow";

export const planDaily = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    automationDate: v.string(),
    now: v.string(),
  },
  handler: async (ctx, { secret, ownerId, automationDate, now }) => {
    assertAutomationWorkerSecret(secret);

    const runId = `automation:swapr:${ownerId}:${automationDate}`;

    if (!isWithinAutomationGlobalWindow(now)) {
      return { runId, status: "skipped", taskIds: [] };
    }

    const preferences = await ctx.db
      .query("automationPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();
    const run = await createAutomationRun(ctx, {
      ownerId,
      id: runId,
      automationDate,
      tool: "swapr",
      idempotencyKey: `${ownerId}:${automationDate}:swapr`,
      inputSnapshotJson: JSON.stringify({
        preferenceVersion: preferences?.preferenceVersion ?? 0,
      }),
      createdAt: now,
    });

    if (run.status !== "queued") {
      return { runId, status: run.status, taskIds: [] };
    }

    if (!preferences?.enabled || !preferences.enabledTools.includes("swapr")) {
      await markAutomationRunSkipped(ctx, run._id, "Swapr automation is disabled.", now);
      return { runId, status: "skipped", taskIds: [] };
    }

    const selectedAvatarIds = new Set(preferences.selectedAvatarIds);
    const photos = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
    const sourcePhoto = photos.find((photo) =>
      preferences.avatarSelectionMode === "selected"
        ? photo.avatarId && selectedAvatarIds.has(photo.avatarId)
        : Boolean(photo.avatarId),
    );
    const clips = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
    const referenceClip = clips.find((clip) => clip.clipType === "ugc");

    if (!sourcePhoto || !referenceClip) {
      await markAutomationRunSkipped(
        ctx,
        run._id,
        "Swapr automation needs an avatar photo and one UGC-compatible reference video.",
        now,
      );
      return { runId, status: "skipped", taskIds: [] };
    }

    await consumeAutomationBudget(ctx, {
      ownerId,
      tool: "swapr",
      providerCostUnits: 10,
    });

    const task = await createAutomationTask(ctx, {
      ownerId,
      id: `${runId}:1`,
      runId,
      tool: "swapr",
      taskType: "swapr-video",
      stage: "awaiting-provider",
      idempotencyKey: `${ownerId}:${automationDate}:swapr:1`,
      inputSnapshotJson: JSON.stringify({
        photoId: sourcePhoto.id,
        photoObject: sourcePhoto.photoObject,
        referenceClipId: referenceClip.id,
        referenceVideoObject: referenceClip.videoObject,
      }),
      createdAt: now,
    });
    await ctx.db.patch(run._id, {
      status: "running",
      startedAt: now,
      updatedAt: now,
    });

    return { runId, status: "running", taskIds: [task.id] };
  },
});
