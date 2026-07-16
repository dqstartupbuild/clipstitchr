import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";
import { emailProviderMaxAttempts } from "../email/emailProviderMaxAttempts";
import { getAccountEmailOperationIsTerminal } from "./getAccountEmailOperationIsTerminal";

export const claimAccountEmailOperation = internalMutation({
  args: {
    leaseExpiresAt: v.number(),
    now: v.number(),
    operationId: v.id("accountEmailOperations"),
    workerId: v.string(),
  },
  handler: async (ctx, args) => {
    if (
      !Number.isFinite(args.now) ||
      !Number.isFinite(args.leaseExpiresAt) ||
      args.leaseExpiresAt <= args.now ||
      args.leaseExpiresAt - args.now > 5 * 60 * 1_000 ||
      !args.workerId.trim()
    ) {
      throw new Error("Invalid account email operation lease.");
    }

    const operation = await ctx.db.get(args.operationId);

    if (
      !operation ||
      getAccountEmailOperationIsTerminal(operation.status) ||
      operation.status === "held" ||
      operation.nextAttemptAt > args.now
    ) {
      return null;
    }

    if (
      operation.status === "claimed" &&
      operation.leaseExpiresAt !== undefined &&
      operation.leaseExpiresAt > args.now
    ) {
      return null;
    }

    const recoveringStartedAttempt =
      operation.status === "claimed" &&
      operation.leaseExpiresAt !== undefined &&
      operation.leaseExpiresAt <= args.now &&
      operation.attemptLeaseOwner !== undefined;

    if (operation.attemptCount >= emailProviderMaxAttempts) {
      await ctx.db.patch(operation._id, {
        acceptanceStatus: recoveringStartedAttempt
          ? "unknown"
          : operation.acceptanceStatus,
        ambiguousAt: recoveringStartedAttempt
          ? (operation.ambiguousAt ?? args.now)
          : operation.ambiguousAt,
        attemptLeaseOwner: undefined,
        failureCategory: "retryLimit",
        leaseExpiresAt: undefined,
        leaseOwner: undefined,
        status: "deadLetter",
        terminalAt: args.now,
        updatedAt: args.now,
      });
      return null;
    }

    if (
      (operation.acceptanceStatus === "unknown" || recoveringStartedAttempt) &&
      operation.idempotencyExpiresAt <= args.now
    ) {
      await ctx.db.patch(operation._id, {
        acceptanceStatus: "unknown",
        ambiguousAt: operation.ambiguousAt ?? args.now,
        attemptLeaseOwner: undefined,
        failureCategory: "ambiguous",
        leaseExpiresAt: undefined,
        leaseOwner: undefined,
        status: "deadLetter",
        terminalAt: args.now,
        updatedAt: args.now,
      });
      return null;
    }

    const contact = await ctx.db
      .query("accountContacts")
      .withIndex("by_owner", (query) =>
        query.eq("ownerId", operation.ownerId),
      )
      .unique();

    if (
      !contact ||
      !contact.emailVerified ||
      contact.emailSuppressedAt !== undefined ||
      contact.deletedAt !== undefined ||
      !contact.normalizedEmail
    ) {
      await ctx.db.patch(operation._id, {
        attemptLeaseOwner: undefined,
        failureCategory: "ineligible",
        leaseExpiresAt: undefined,
        leaseOwner: undefined,
        nextAttemptAt: args.now,
        status: "held",
        updatedAt: args.now,
      });
      return null;
    }

    await ctx.db.patch(operation._id, {
      acceptanceStatus: recoveringStartedAttempt
        ? "unknown"
        : operation.acceptanceStatus,
      ambiguousAt: recoveringStartedAttempt
        ? (operation.ambiguousAt ?? args.now)
        : operation.ambiguousAt,
      attemptLeaseOwner: undefined,
      leaseExpiresAt: args.leaseExpiresAt,
      leaseOwner: args.workerId,
      status: "claimed",
      updatedAt: args.now,
    });
    await ctx.scheduler.runAt(
      args.leaseExpiresAt + 1_000,
      internal.accountEmail.processAccountEmailOperation
        .processAccountEmailOperation,
      { operationId: operation._id },
    );

    return await ctx.db.get(operation._id);
  },
});
