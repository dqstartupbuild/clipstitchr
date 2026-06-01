import { v } from "convex/values";
import { consumeAutomationBudget } from "./automationBudget";
import { createAutomationRun } from "./automationCreateRun";
import { createAutomationTask } from "./automationCreateTask";
import { markAutomationRunSkipped } from "./automationMarkRunSkipped";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { mutation } from "./_generated/server";
import { getDefaultAvatarForOwner } from "./getDefaultAvatarForOwner";
import { getIsAutomationToolEnabled } from "../lib/clipstitchr/constants/automationToolFeatureFlags";
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

    if (!isWithinAutomationGlobalWindow(now)) {
      return {
        status: "skipped",
        taskIds: [],
      };
    }

    const preferences = await ctx.db
      .query("automationPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();

    if (!getIsAutomationToolEnabled("avatar-photo")) {
      return {
        status: "skipped",
        taskIds: [],
      };
    }

    if (!preferences?.enabled || !preferences.enabledTools.includes("avatar-photo")) {
      return {
        status: "skipped",
        taskIds: [],
      };
    }

    const defaultAvatar = await getDefaultAvatarForOwner(ctx, ownerId);
    const eligibleAvatars = defaultAvatar ? [defaultAvatar] : [];

    if (eligibleAvatars.length === 0) {
      return {
        status: "skipped",
        taskIds: [],
      };
    }

    const photos = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
    const taskIds: string[] = [];

    for (const avatar of eligibleAvatars) {
      const sourcePhoto = photos.find((photo) => photo.avatarId === avatar.id);
      const runId = `automation:avatar-photo:${ownerId}:${automationDate}:${avatar.id}`;
      const idempotencyKey = `${ownerId}:${automationDate}:avatar-photo:${avatar.id}`;
      const run = await createAutomationRun(ctx, {
        ownerId,
        id: runId,
        automationDate,
        tool: "avatar-photo",
        idempotencyKey,
        inputSnapshotJson: JSON.stringify({
          avatarId: avatar.id,
          avatarName: avatar.name,
          sourcePhotoId: sourcePhoto?.id,
        }),
        createdAt: now,
      });

      if (run.status !== "queued") {
        continue;
      }

      if (!sourcePhoto) {
        await markAutomationRunSkipped(
          ctx,
          run._id,
          "Avatar photo automation needs at least one source photo.",
          now,
        );
        continue;
      }

      await consumeAutomationBudget(ctx, {
        ownerId,
        tool: "avatar-photo",
        avatarId: avatar.id,
        providerCostUnits: 1,
      });

      const task = await createAutomationTask(ctx, {
        ownerId,
        id: `automation:avatar-photo:${ownerId}:${automationDate}:${avatar.id}:1`,
        runId,
        tool: "avatar-photo",
        taskType: "avatar-photo",
        stage: "awaiting-provider",
        idempotencyKey: `${idempotencyKey}:task`,
        inputSnapshotJson: JSON.stringify({
          automationDate,
          avatarId: avatar.id,
          avatarName: avatar.name,
          avatarDescription: avatar.description,
          wardrobeStyle: avatar.wardrobeStyle,
          sourcePhotoId: sourcePhoto.id,
          sourcePhotoObject: sourcePhoto.photoObject,
        }),
        createdAt: now,
      });
      await ctx.db.patch(run._id, {
        status: "running",
        startedAt: now,
        updatedAt: now,
      });
      taskIds.push(task.id);
    }

    return {
      status: taskIds.length > 0 ? "running" : "skipped",
      taskIds,
    };
  },
});
