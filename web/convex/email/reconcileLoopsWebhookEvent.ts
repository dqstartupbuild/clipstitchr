import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { applyEmailProviderWebhookEvidence } from "./applyEmailProviderWebhookEvidence";
import { cancelEmailProviderOperationsForContact } from "./cancelEmailProviderOperationsForContact";
import { applyProviderDeletionTombstone } from "../marketingContacts/applyProviderDeletionTombstone";
import { loopsWebhookEventTypeValidator } from "../validators/loopsWebhookEventType";
import type { Doc, Id } from "../_generated/dataModel";
import { normalizeToolLeadEmail } from "../../lib/clipstitchr/tools/toolLeads/normalizeToolLeadEmail";
import { getEmailDeliveryEventIsStale } from "./getEmailDeliveryEventIsStale";
import { getLoopsWebhookEventAt } from "./getLoopsWebhookEventAt";
import { getMarketingMailingListEventIsStale } from "./getMarketingMailingListEventIsStale";
import { getMarketingSuppressionEventIsStale } from "./getMarketingSuppressionEventIsStale";
import { getOrBindConfirmationEmailOperation } from "./getOrBindConfirmationEmailOperation";
import { getMarketingSubscriptionEventIsStale } from "./getMarketingSubscriptionEventIsStale";

const nullableString = v.union(v.null(), v.string());

export const reconcileLoopsWebhookEvent = internalMutation({
  args: {
    contactIdentity: v.union(
      v.null(),
      v.object({
        email: v.string(),
        id: v.string(),
        userId: nullableString,
      }),
    ),
    eventName: loopsWebhookEventTypeValidator,
    eventTime: v.number(),
    mailingListId: nullableString,
    providerEmailId: nullableString,
    providerEmailMessageId: nullableString,
    providerSourceId: nullableString,
    receivedAt: v.number(),
    sourceType: v.union(
      v.null(),
      v.literal("campaign"),
      v.literal("loop"),
      v.literal("transactional"),
    ),
    webhookId: v.string(),
    webhookSchemaVersion: v.literal("1.0.0"),
  },
  handler: async (ctx, args) => {
    const eventAt = getLoopsWebhookEventAt(args.eventTime, args.receivedAt);

    if (
      !args.webhookId ||
      args.webhookId.length > 256 ||
      eventAt === null ||
      ((args.eventName === "contact.mailingList.subscribed" ||
        args.eventName === "contact.mailingList.unsubscribed") &&
        !args.mailingListId)
    ) {
      throw new Error("Invalid webhook event.");
    }

    const duplicate = await ctx.db
      .query("loopsWebhookEvents")
      .withIndex("by_webhook_id", (query) =>
        query.eq("webhookId", args.webhookId),
      )
      .unique();

    if (duplicate) return { status: "duplicate" as const };

    let contact: Doc<"marketingContacts"> | null = null;
    let linkedByEmail = false;
    const confirmationTransactionalId =
      process.env.LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID?.trim();
    const isApprovedConfirmationTemplate = Boolean(
      confirmationTransactionalId &&
      args.sourceType === "transactional" &&
      args.providerSourceId === confirmationTransactionalId,
    );
    const isConfirmationDeliveryEvent =
      args.eventName === "transactional.email.sent" ||
      args.eventName === "email.delivered" ||
      args.eventName === "email.softBounced" ||
      args.eventName === "email.hardBounced" ||
      args.eventName === "email.spamReported";

    if (args.contactIdentity?.userId) {
      contact = await ctx.db
        .query("marketingContacts")
        .withIndex("by_provider_contact_key", (query) =>
          query.eq("providerContactKey", args.contactIdentity!.userId!),
        )
        .unique();
    } else if (args.contactIdentity?.id) {
      contact = await ctx.db
        .query("marketingContacts")
        .withIndex("by_provider_contact_id", (query) =>
          query.eq("providerContactId", args.contactIdentity!.id),
        )
        .unique();
    }

    if (
      !contact &&
      args.contactIdentity &&
      isConfirmationDeliveryEvent &&
      isApprovedConfirmationTemplate
    ) {
      const candidates = await ctx.db
        .query("marketingContacts")
        .withIndex("by_normalized_email", (query) =>
          query.eq(
            "normalizedEmail",
            normalizeToolLeadEmail(args.contactIdentity!.email),
          ),
        )
        .collect();

      if (candidates.length === 1) {
        contact = candidates[0] ?? null;
        linkedByEmail = Boolean(contact);
      }
    }

    let disposition: "applied" | "ignoredStale" | "ignoredUnlinked" = "applied";
    let operationId: Id<"emailProviderOperations"> | undefined = undefined;
    const isDeliveryEvent =
      args.eventName === "email.delivered" ||
      args.eventName === "email.softBounced" ||
      args.eventName === "email.hardBounced" ||
      args.eventName === "email.spamReported";
    let deliveryOperation: Doc<"emailProviderOperations"> | null = null;

    if (args.providerEmailId && isDeliveryEvent) {
      deliveryOperation =
        contact && isApprovedConfirmationTemplate
          ? await getOrBindConfirmationEmailOperation(ctx, {
              contactId: contact._id,
              eventAt,
              providerMessageId: args.providerEmailId,
              receivedAt: args.receivedAt,
            })
          : await ctx.db
              .query("emailProviderOperations")
              .withIndex("by_provider_message_id", (query) =>
                query.eq("providerMessageId", args.providerEmailId!),
              )
              .unique();
    }

    if (args.eventName === "testing.testEvent") {
      disposition = "applied";
    } else if (args.eventName === "contact.deleted" && args.contactIdentity) {
      const deletion = await applyProviderDeletionTombstone(ctx, {
        appliedAt: args.receivedAt,
        eventAt,
        providerContactId: args.contactIdentity.id,
        providerContactKey:
          args.contactIdentity.userId ??
          `unlinked-provider-${args.contactIdentity.id}`,
        webhookId: args.webhookId,
      });
      contact = deletion.contactId
        ? await ctx.db.get(deletion.contactId)
        : null;
      disposition = deletion.applied
        ? "applied"
        : deletion.contactId
          ? "ignoredStale"
          : "ignoredUnlinked";
    } else if (!contact) {
      disposition = "ignoredUnlinked";
    } else if (
      (args.eventName === "contact.mailingList.subscribed" ||
        args.eventName === "contact.mailingList.unsubscribed") &&
      args.mailingListId
    ) {
      const contactId = contact._id;
      const membership = await ctx.db
        .query("marketingMailingListMemberships")
        .withIndex("by_contact_list", (query) =>
          query
            .eq("contactId", contactId)
            .eq("providerMailingListId", args.mailingListId!),
        )
        .unique();
      const incomingStatus =
        args.eventName === "contact.mailingList.subscribed"
          ? ("subscribed" as const)
          : ("unsubscribed" as const);

      if (
        membership &&
        getMarketingMailingListEventIsStale(membership, eventAt, incomingStatus)
      ) {
        disposition = "ignoredStale";
      } else if (membership) {
        await ctx.db.patch(membership._id, {
          status: incomingStatus,
          eventAt,
          updatedAt: args.receivedAt,
        });
      } else {
        await ctx.db.insert("marketingMailingListMemberships", {
          contactId,
          providerMailingListId: args.mailingListId,
          status: incomingStatus,
          eventAt,
          updatedAt: args.receivedAt,
        });
      }
    } else if (args.eventName === "transactional.email.sent") {
      if (!args.providerEmailId || !isApprovedConfirmationTemplate) {
        disposition = "ignoredUnlinked";
      } else {
        const operation = await getOrBindConfirmationEmailOperation(ctx, {
          contactId: contact._id,
          eventAt,
          providerMessageId: args.providerEmailId,
          receivedAt: args.receivedAt,
        });

        if (!operation) {
          disposition = "ignoredUnlinked";
        } else {
          operationId = operation._id;
          await applyEmailProviderWebhookEvidence(ctx, {
            eventAt,
            operationId: operation._id,
            receivedAt: args.receivedAt,
          });
          if (linkedByEmail && args.contactIdentity) {
            await ctx.db.patch(contact._id, {
              providerContactId: args.contactIdentity.id,
              updatedAt: args.receivedAt,
            });
          }
        }
      }
    } else if (args.eventName === "contact.created") {
      if (
        contact.deletionStatus === "privacyDeleted" ||
        (contact.deletionChangedAt !== undefined &&
          contact.deletionChangedAt > eventAt)
      ) {
        disposition = "ignoredStale";
      } else {
        await ctx.db.patch(contact._id, {
          providerContactId: args.contactIdentity?.id,
          updatedAt: args.receivedAt,
        });
      }
    } else if (
      args.eventName === "contact.unsubscribed" ||
      args.eventName === "email.unsubscribed"
    ) {
      if (
        getMarketingSubscriptionEventIsStale(contact, eventAt, "unsubscribed")
      ) {
        disposition = "ignoredStale";
      } else {
        await ctx.db.patch(contact._id, {
          consentStatus: "withdrawn",
          subscriptionStatus: "unsubscribed",
          subscriptionChangedAt: eventAt,
          marketingEligible: false,
          updatedAt: args.receivedAt,
        });
        if (contact.currentConsentId) {
          const consent = await ctx.db.get(contact.currentConsentId);
          if (consent) {
            await ctx.db.patch(consent._id, {
              status: "withdrawn",
              withdrawnAt: eventAt,
            });
          }
        }
        await cancelEmailProviderOperationsForContact(
          ctx,
          contact._id,
          args.receivedAt,
        );
      }
    } else if (args.eventName === "email.resubscribed") {
      if (
        getMarketingSubscriptionEventIsStale(contact, eventAt, "subscribed") ||
        contact.consentStatus !== "confirmed" ||
        contact.verificationStatus !== "verified" ||
        contact.suppressionStatus !== "none" ||
        contact.deletionStatus !== "active"
      ) {
        disposition = "ignoredStale";
      } else {
        await ctx.db.patch(contact._id, {
          subscriptionStatus: "subscribed",
          subscriptionChangedAt: eventAt,
          marketingEligible: true,
          updatedAt: args.receivedAt,
        });
      }
    } else if (
      args.eventName === "email.hardBounced" ||
      args.eventName === "email.spamReported"
    ) {
      const incomingSuppressionStatus =
        args.eventName === "email.hardBounced"
          ? ("hardBounce" as const)
          : ("complaint" as const);

      if (
        getMarketingSuppressionEventIsStale(
          contact,
          eventAt,
          incomingSuppressionStatus,
        )
      ) {
        disposition = "ignoredStale";
      } else {
        await ctx.db.patch(contact._id, {
          suppressionStatus: incomingSuppressionStatus,
          suppressionChangedAt: eventAt,
          marketingEligible: false,
          updatedAt: args.receivedAt,
        });
        await cancelEmailProviderOperationsForContact(
          ctx,
          contact._id,
          args.receivedAt,
        );
      }
    }

    if (args.providerEmailId && isDeliveryEvent) {
      const operation = deliveryOperation;
      const incomingDeliveryStatus =
        args.eventName === "email.spamReported"
          ? ("complained" as const)
          : args.eventName === "email.delivered"
            ? ("delivered" as const)
            : ("bounced" as const);

      if (
        operation &&
        (!contact || operation.contactId === contact._id) &&
        !getEmailDeliveryEventIsStale(
          operation,
          eventAt,
          incomingDeliveryStatus,
        )
      ) {
        operationId = operation._id;
        await applyEmailProviderWebhookEvidence(ctx, {
          deliveryStatus: incomingDeliveryStatus,
          eventAt,
          operationId: operation._id,
          receivedAt: args.receivedAt,
        });
        if (linkedByEmail && args.contactIdentity) {
          await ctx.db.patch(contact!._id, {
            providerContactId: args.contactIdentity.id,
            updatedAt: args.receivedAt,
          });
        }
      } else if (
        operation &&
        (!contact || operation.contactId === contact._id)
      ) {
        disposition = "ignoredStale";
      } else if (
        args.eventName === "email.delivered" ||
        args.eventName === "email.softBounced"
      ) {
        disposition = "ignoredUnlinked";
      }
    }

    await ctx.db.insert("loopsWebhookEvents", {
      webhookId: args.webhookId,
      eventType: args.eventName,
      schemaVersion: args.webhookSchemaVersion,
      eventAt,
      disposition,
      ...(contact ? { contactId: contact._id } : {}),
      ...(operationId ? { operationId } : {}),
      processedAt: args.receivedAt,
    });

    return { status: disposition };
  },
});
