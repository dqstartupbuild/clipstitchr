import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { getClerkAccountEventIsStale } from "./getClerkAccountEventIsStale";
import { cancelAccountEmailOperationsForOwner } from "./cancelAccountEmailOperationsForOwner";
import { createAccountCreatedCommunication } from "./createAccountCreatedCommunication";
import { resumeHeldAccountEmailOperationsForOwner } from "./resumeHeldAccountEmailOperationsForOwner";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const eventTypeValidator = v.union(
  v.literal("user.created"),
  v.literal("user.updated"),
  v.literal("user.deleted"),
);

const contactValidator = v.object({
  displayName: v.optional(v.string()),
  firstName: v.optional(v.string()),
  normalizedEmail: v.string(),
  primaryEmailId: v.string(),
});

export const reconcileClerkUserEvent = internalMutation({
  args: {
    contact: v.optional(contactValidator),
    eventAt: v.number(),
    eventType: eventTypeValidator,
    ownerId: v.optional(v.string()),
    processedAt: v.number(),
    webhookId: v.string(),
  },
  handler: async (ctx, args) => {
    if (
      !args.webhookId ||
      args.webhookId.length > 256 ||
      !Number.isSafeInteger(args.eventAt) ||
      args.eventAt <= 0 ||
      !Number.isSafeInteger(args.processedAt) ||
      args.processedAt <= 0
    ) {
      throw new Error("Invalid Clerk webhook event.");
    }

    const duplicate = await ctx.db
      .query("clerkWebhookEvents")
      .withIndex("by_webhook", (query) =>
        query.eq("webhookId", args.webhookId),
      )
      .unique();

    if (duplicate) {
      return { status: "duplicate" as const, welcomeEligible: false };
    }

    const ownerId = args.ownerId?.trim();
    const ownerIdIsValid = Boolean(ownerId && ownerId.length <= 256);
    const current = ownerIdIsValid
      ? await ctx.db
          .query("accountContacts")
          .withIndex("by_owner", (query) => query.eq("ownerId", ownerId!))
          .unique()
      : null;
    const eventIsStale = Boolean(
      current &&
        getClerkAccountEventIsStale(current, {
          eventAt: args.eventAt,
          eventType: args.eventType,
          webhookId: args.webhookId,
        }),
    );
    const normalizedEmail = args.contact?.normalizedEmail.trim().toLowerCase();
    const primaryEmailId = args.contact?.primaryEmailId.trim();
    const contactIsValid = Boolean(
      normalizedEmail &&
        normalizedEmail.length <= 320 &&
        emailPattern.test(normalizedEmail) &&
        primaryEmailId &&
        primaryEmailId.length <= 256,
    );
    let status: "processed" | "ignored" = "ignored";
    let welcomeEligible = false;

    if (ownerIdIsValid && !eventIsStale && args.eventType === "user.deleted") {
      const deletedContact = {
        deletedAt: args.eventAt,
        displayName: undefined,
        emailVerified: false,
        firstName: undefined,
        lastClerkEventAt: args.eventAt,
        lastClerkWebhookId: args.webhookId,
        normalizedEmail: "",
        primaryEmailId: "",
        updatedAt: args.processedAt,
      };

      if (current) {
        await ctx.db.patch(current._id, deletedContact);
      } else {
        await ctx.db.insert("accountContacts", {
          ...deletedContact,
          createdAt: args.processedAt,
          ownerId: ownerId!,
        });
      }

      await cancelAccountEmailOperationsForOwner(ctx, {
        canceledAt: args.processedAt,
        ownerId: ownerId!,
      });

      status = "processed";
    } else if (
      ownerIdIsValid &&
      !eventIsStale &&
      args.eventType !== "user.deleted" &&
      contactIsValid
    ) {
      const activeContact = {
        deletedAt: undefined,
        displayName: args.contact?.displayName,
        emailVerified: true,
        firstName: args.contact?.firstName,
        lastClerkEventAt: args.eventAt,
        lastClerkWebhookId: args.webhookId,
        normalizedEmail: normalizedEmail!,
        primaryEmailId: primaryEmailId!,
        updatedAt: args.processedAt,
        ...(current && current.normalizedEmail !== normalizedEmail
          ? {
              emailSuppressedAt: undefined,
              emailSuppressionReason: undefined,
            }
          : {}),
      };

      if (current) {
        await ctx.db.patch(current._id, activeContact);
      } else {
        await ctx.db.insert("accountContacts", {
          ...activeContact,
          createdAt: args.processedAt,
          ownerId: ownerId!,
        });
        welcomeEligible = true;
      }

      await resumeHeldAccountEmailOperationsForOwner(ctx, {
        now: args.processedAt,
        ownerId: ownerId!,
      });
      if (welcomeEligible) {
        await createAccountCreatedCommunication(ctx, {
          now: args.processedAt,
          ownerId: ownerId!,
        });
      }

      status = "processed";
    }

    await ctx.db.insert("clerkWebhookEvents", {
      eventAt: args.eventAt,
      eventType: args.eventType,
      ownerId: ownerIdIsValid ? ownerId : undefined,
      processedAt: args.processedAt,
      status,
      webhookId: args.webhookId,
    });

    return { status, welcomeEligible };
  },
});
