import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioLazyReelActiveProduct } from "../studioLazyReel/assertStudioLazyReelActiveProduct";
import { assertStudioLazyReelBoundedString } from "../studioLazyReel/assertStudioLazyReelBoundedString";
import { consumeStudioLazyReelRecordWriteRateLimits } from "../studioLazyReel/consumeStudioLazyReelRecordWriteRateLimits";
import { normalizeStudioLazyReelJsonSnapshot } from "../studioLazyReel/normalizeStudioLazyReelJsonSnapshot";
import { getStudioLazyReelResearchRunForOwnerProduct } from "../studioLazyReelResearchRuns/getStudioLazyReelResearchRunForOwnerProduct";
import { studioLazyReelIdentityValidator } from "../validators/studioLazyReelIdentity";
import { studioLazyReelJsonSnapshotInputValidator } from "../validators/studioLazyReelJsonSnapshotInput";
import { getStudioLazyReelSavedReportForOwnerProduct } from "./getStudioLazyReelSavedReportForOwnerProduct";

export const save = mutation({
  args: {
    id: v.string(),
    productId: v.string(),
    researchRunId: v.string(),
    title: v.string(),
    identity: studioLazyReelIdentityValidator,
    sourceSnapshotVersion: v.string(),
    reportSnapshot: studioLazyReelJsonSnapshotInputValidator,
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productId = assertStudioLazyReelBoundedString(args.productId, {
      label: "Product ID",
      maxLength: 120,
    });

    await assertStudioBetaAccess(ctx, ownerId);
    await assertStudioLazyReelActiveProduct(ctx, ownerId, productId);

    const id = assertStudioLazyReelBoundedString(args.id, {
      label: "Saved report ID",
      maxLength: 120,
    });
    const researchRunId = assertStudioLazyReelBoundedString(
      args.researchRunId,
      { label: "Research run ID", maxLength: 120 },
    );
    const title = assertStudioLazyReelBoundedString(args.title, {
      label: "Saved report title",
      maxLength: 160,
    });
    const sourceSnapshotVersion = assertStudioLazyReelBoundedString(
      args.sourceSnapshotVersion,
      { label: "Source snapshot version", maxLength: 80 },
    );
    const reportSnapshot = normalizeStudioLazyReelJsonSnapshot(
      args.reportSnapshot,
      { label: "Saved research report", maxBytes: 262_144 },
    );
    const existing = await getStudioLazyReelSavedReportForOwnerProduct(
      ctx,
      ownerId,
      productId,
      id,
    );

    if (existing) {
      const isMatchingRetry =
        existing.researchRunId === researchRunId &&
        existing.title === title &&
        existing.identity.kind === args.identity.kind &&
        existing.identity.key === args.identity.key &&
        existing.sourceSnapshotVersion === sourceSnapshotVersion &&
        existing.reportSnapshot.schemaVersion === reportSnapshot.schemaVersion &&
        existing.reportSnapshot.payloadJson === reportSnapshot.payloadJson;

      if (!isMatchingRetry) {
        throw new Error("Saved report ID is already in use.");
      }

      return { created: false, report: existing };
    }

    const run = await getStudioLazyReelResearchRunForOwnerProduct(
      ctx,
      ownerId,
      productId,
      researchRunId,
    );

    if (
      !run ||
      run.status !== "completed" ||
      run.identity.kind !== args.identity.kind ||
      run.identity.key !== args.identity.key ||
      run.sourceSnapshotVersion !== sourceSnapshotVersion
    ) {
      throw new Error("Completed research run not found for this Product.");
    }

    await consumeStudioLazyReelRecordWriteRateLimits(ctx, ownerId);

    const now = new Date().toISOString();
    const documentId = await ctx.db.insert("studioLazyReelSavedReports", {
      ownerId,
      id,
      productId,
      researchRunId,
      title,
      identity: args.identity,
      status: "active",
      recordVersion: 1,
      sourceSnapshotVersion,
      reportSnapshot,
      createdAt: now,
      updatedAt: now,
    });
    const report = await ctx.db.get(documentId);

    if (!report) {
      throw new Error("Saved report could not be read after creation.");
    }

    return { created: true, report };
  },
});
