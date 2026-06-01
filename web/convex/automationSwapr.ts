import { v } from "convex/values";
import { consumeAutomationBudget } from "./automationBudget";
import { createAutomationRun } from "./automationCreateRun";
import { createAutomationTask } from "./automationCreateTask";
import { markAutomationRunSkipped } from "./automationMarkRunSkipped";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { mutation } from "./_generated/server";
import { isSwaprAutomationEnabled } from "../lib/clipstitchr/constants/isSwaprAutomationEnabled";
import { getDefaultAvatarForOwner } from "./getDefaultAvatarForOwner";
import { isWithinAutomationGlobalWindow } from "./isWithinAutomationGlobalWindow";

const AUTOMATION_SWAPR_CHARACTER_ORIENTATION = "image";
const AUTOMATION_SWAPR_KEEP_ORIGINAL_SOUND = false;
const AUTOMATION_SWAPR_MODE = "std";
const AUTOMATION_SWAPR_PROMPT =
  "Keep the creator in a natural phone-camera UGC style with the same casual setting and lighting.";
const AUTOMATION_SWAPR_REFERENCE_DURATION_LIMIT_SECONDS = 10;
const AUTOMATION_SWAPR_REFERENCE_MAX_SIZE_BYTES = 100 * 1024 * 1024;

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

    if (!isSwaprAutomationEnabled) {
      await markAutomationRunSkipped(
        ctx,
        run._id,
        "Swapr automation is disabled by the code flag.",
        now,
      );
      return { runId, status: "skipped", taskIds: [] };
    }

    if (!preferences?.enabled || !preferences.enabledTools.includes("swapr")) {
      await markAutomationRunSkipped(
        ctx,
        run._id,
        "Swapr automation is disabled.",
        now,
      );
      return { runId, status: "skipped", taskIds: [] };
    }

    const defaultAvatar = await getDefaultAvatarForOwner(ctx, ownerId);
    if (!defaultAvatar) {
      await markAutomationRunSkipped(
        ctx,
        run._id,
        "Swapr automation needs a default avatar.",
        now,
      );
      return { runId, status: "skipped", taskIds: [] };
    }

    const photos = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
    const sourcePhoto = photos.find(
      (photo) =>
        photo.avatarId === defaultAvatar.id &&
        photo.photoObject.contentType.startsWith("image/"),
    );
    const clips = await ctx.db
      .query("videoClips")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
    const referenceClip = clips.find(
      (clip) =>
        clip.clipType === "ugc" &&
        clip.videoObject.contentType.startsWith("video/") &&
        clip.videoObject.size <= AUTOMATION_SWAPR_REFERENCE_MAX_SIZE_BYTES &&
        clip.duration >= 3 &&
        clip.duration <= AUTOMATION_SWAPR_REFERENCE_DURATION_LIMIT_SECONDS,
    );

    if (!sourcePhoto || !referenceClip) {
      await markAutomationRunSkipped(
        ctx,
        run._id,
        "Swapr automation needs an avatar photo and one provider-ready UGC reference video.",
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
        automationDate,
        characterOrientation: AUTOMATION_SWAPR_CHARACTER_ORIENTATION,
        keepOriginalSound: AUTOMATION_SWAPR_KEEP_ORIGINAL_SOUND,
        mode: AUTOMATION_SWAPR_MODE,
        photoId: sourcePhoto.id,
        photoObject: sourcePhoto.photoObject,
        prompt: AUTOMATION_SWAPR_PROMPT,
        referenceClipId: referenceClip.id,
        referenceClipName: referenceClip.name,
        referenceDurationSeconds: referenceClip.duration,
        referenceVideoObject: referenceClip.videoObject,
        sourcePhotoName: sourcePhoto.name,
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
