import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { enqueueContactDeleteCompensation } from "./enqueueContactDeleteCompensation";
import { enqueueContactUnsubscribeCompensation } from "./enqueueContactUnsubscribeCompensation";

export const recordEmailProviderOperationAccepted = internalMutation({
  args: {
    acceptedAt: v.number(),
    operationId: v.id("emailProviderOperations"),
    providerMessageId: v.optional(v.string()),
    workerId: v.string(),
  },
  handler: async (ctx, args) => {
    const operation = await ctx.db.get(args.operationId);

    if (
      !operation ||
      !Number.isFinite(args.acceptedAt) ||
      (args.providerMessageId !== undefined &&
        (args.providerMessageId.length < 1 ||
          args.providerMessageId.length > 256))
    ) {
      return { recorded: false as const };
    }

    if (
      operation.status !== "claimed" ||
      operation.leaseOwner !== args.workerId
    ) {
      const deleteCompensationOperationId =
        operation.kind !== "contactDelete" && operation.attemptCount >= 1
          ? await enqueueContactDeleteCompensation(ctx, {
              compensatesOperationId: operation._id,
              contactId: operation.contactId,
              now: args.acceptedAt,
            })
          : null;

      if (deleteCompensationOperationId) {
        await ctx.db.patch(operation._id, {
          acceptanceStatus: "accepted",
          acceptedAt: operation.acceptedAt ?? args.acceptedAt,
          attemptLeaseOwner: undefined,
          updatedAt: Math.max(operation.updatedAt, args.acceptedAt),
        });

        return { compensationQueued: true as const, recorded: false as const };
      }

      if (
        operation.kind === "contactResubscribe" &&
        operation.status !== "canceled" &&
        operation.attemptCount >= 1
      ) {
        await ctx.db.patch(operation._id, {
          acceptanceStatus: "accepted",
          acceptedAt: operation.acceptedAt ?? args.acceptedAt,
          updatedAt: Math.max(operation.updatedAt, args.acceptedAt),
        });

        return { compensationQueued: false as const, recorded: false as const };
      }

      if (operation.status !== "canceled" || operation.attemptCount < 1) {
        return { recorded: false as const };
      }

      await ctx.db.patch(operation._id, {
        acceptanceStatus: "accepted",
        acceptedAt: operation.acceptedAt ?? args.acceptedAt,
        attemptLeaseOwner: undefined,
        updatedAt: Math.max(operation.updatedAt, args.acceptedAt),
      });

      if (operation.enrollmentId) {
        const enrollment = await ctx.db.get(operation.enrollmentId);

        if (enrollment && enrollment.operationId === operation._id) {
          await ctx.db.patch(enrollment._id, {
            status: "accepted",
            updatedAt: args.acceptedAt,
          });
        }
      }
      const compensationOperationId =
        operation.kind === "contactResubscribe"
          ? await enqueueContactUnsubscribeCompensation(ctx, {
              compensatesOperationId: operation._id,
              contactId: operation.contactId,
              now: args.acceptedAt,
            })
          : null;

      return {
        compensationQueued: compensationOperationId !== null,
        recorded: false as const,
      };
    }

    await ctx.db.patch(operation._id, {
      status: "accepted",
      acceptanceStatus: "accepted",
      acceptedAt: args.acceptedAt,
      attemptLeaseOwner: undefined,
      ...(args.providerMessageId
        ? { providerMessageId: args.providerMessageId }
        : {}),
      leaseOwner: undefined,
      leaseExpiresAt: undefined,
      terminalAt: args.acceptedAt,
      updatedAt: args.acceptedAt,
    });

    if (operation.enrollmentId) {
      const enrollment = await ctx.db.get(operation.enrollmentId);

      if (enrollment && enrollment.operationId === operation._id) {
        await ctx.db.patch(enrollment._id, {
          status: "accepted",
          updatedAt: args.acceptedAt,
        });
      }
    }

    return { compensationQueued: false as const, recorded: true as const };
  },
});
