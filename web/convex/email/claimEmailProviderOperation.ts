import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";
import { emailProviderMaxAttempts } from "./emailProviderMaxAttempts";
import { getEmailOperationDispatchEligibility } from "./getEmailOperationDispatchEligibility";
import { getEmailProviderOperationIsTerminal } from "./getEmailProviderOperationIsTerminal";
import { getEmailDependencyRetryAt } from "./getEmailDependencyRetryAt";

export const claimEmailProviderOperation = internalMutation({
  args: {
    leaseExpiresAt: v.number(),
    now: v.number(),
    operationId: v.id("emailProviderOperations"),
    workerId: v.string(),
  },
  handler: async (ctx, { leaseExpiresAt, now, operationId, workerId }) => {
    if (
      !Number.isFinite(now) ||
      !Number.isFinite(leaseExpiresAt) ||
      leaseExpiresAt <= now ||
      leaseExpiresAt - now > 5 * 60 * 1000 ||
      !workerId.trim()
    ) {
      throw new Error("Invalid email operation lease.");
    }

    const operation = await ctx.db.get(operationId);

    if (!operation || getEmailProviderOperationIsTerminal(operation.status)) {
      return null;
    }

    if (operation.status === "held" || operation.nextAttemptAt > now) {
      return null;
    }

    if (
      operation.status === "claimed" &&
      operation.leaseExpiresAt !== undefined &&
      operation.leaseExpiresAt > now
    ) {
      return null;
    }

    const isRecoveringStartedAttempt =
      operation.status === "claimed" &&
      operation.leaseExpiresAt !== undefined &&
      operation.leaseExpiresAt <= now &&
      operation.attemptLeaseOwner !== undefined;

    if (operation.attemptCount >= emailProviderMaxAttempts) {
      await ctx.db.patch(operationId, {
        status: "deadLetter",
        failureCategory: "retryLimit",
        ...(isRecoveringStartedAttempt
          ? {
              acceptanceStatus: "unknown" as const,
              ambiguousAt: operation.ambiguousAt ?? now,
            }
          : {}),
        terminalAt: now,
        leaseOwner: undefined,
        leaseExpiresAt: undefined,
        attemptLeaseOwner: undefined,
        updatedAt: now,
      });

      return null;
    }

    if (
      operation.kind !== "contactDelete" &&
      (operation.acceptanceStatus === "unknown" ||
        isRecoveringStartedAttempt) &&
      operation.idempotencyExpiresAt <= now
    ) {
      await ctx.db.patch(operationId, {
        status: "deadLetter",
        failureCategory: "ambiguous",
        terminalAt: now,
        leaseOwner: undefined,
        leaseExpiresAt: undefined,
        updatedAt: now,
      });

      return null;
    }

    if (operation.dependsOnOperationId) {
      const dependency = await ctx.db.get(operation.dependsOnOperationId);

      if (!dependency || dependency.status !== "accepted") {
        if (!dependency || getEmailProviderOperationIsTerminal(dependency.status)) {
          await ctx.db.patch(operationId, {
            status: "canceled",
            failureCategory: "ineligible",
            terminalAt: now,
            updatedAt: now,
          });
        } else if (dependency) {
          const retryAt = getEmailDependencyRetryAt(dependency, now);

          await ctx.db.patch(operationId, {
            nextAttemptAt: retryAt,
            updatedAt: now,
          });
          await ctx.scheduler.runAt(
            retryAt,
            internal.email.processEmailProviderOperation
              .processEmailProviderOperation,
            { operationId },
          );
        }

        return null;
      }
    }

    const contact = await ctx.db.get(operation.contactId);
    const tombstones = contact
      ? await ctx.db
          .query("providerDeletionTombstones")
          .withIndex("by_provider_contact_key", (query) =>
            query.eq("providerContactKey", contact.providerContactKey),
          )
          .collect()
      : [];
    const tombstone =
      tombstones.find((candidate) => candidate.clearedAt === undefined) ?? null;
    const eligibility = getEmailOperationDispatchEligibility({
      contact,
      operation,
      tombstone,
    });

    if (!eligibility.eligible) {
      await ctx.db.patch(operationId, {
        status: "canceled",
        failureCategory: "ineligible",
        terminalAt: now,
        updatedAt: now,
      });

      return null;
    }

    if (operation.confirmationTokenId) {
      const confirmationToken = await ctx.db.get(operation.confirmationTokenId);

      if (
        !confirmationToken ||
        confirmationToken.usedAt !== undefined ||
        confirmationToken.supersededAt !== undefined ||
        confirmationToken.expiresAt <= now
      ) {
        await ctx.db.patch(operationId, {
          status: "superseded",
          terminalAt: now,
          updatedAt: now,
        });

        return null;
      }
    }

    await ctx.db.patch(operationId, {
      status: "claimed",
      ...(isRecoveringStartedAttempt
        ? {
            acceptanceStatus: "unknown" as const,
            ambiguousAt: operation.ambiguousAt ?? now,
          }
        : {}),
      leaseOwner: workerId,
      leaseExpiresAt,
      attemptLeaseOwner: undefined,
      updatedAt: now,
    });
    await ctx.scheduler.runAt(
      leaseExpiresAt + 1_000,
      internal.email.processEmailProviderOperation.processEmailProviderOperation,
      { operationId },
    );

    return await ctx.db.get(operationId);
  },
});
