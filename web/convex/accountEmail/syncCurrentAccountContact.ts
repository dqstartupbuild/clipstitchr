import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";
import { normalizeToolLeadEmail } from "../../lib/clipstitchr/tools/toolLeads/normalizeToolLeadEmail";
import { normalizeClerkAccountName } from "./normalizeClerkAccountName";
import { createAccountCreatedCommunication } from "./createAccountCreatedCommunication";
import { resumeHeldAccountEmailOperationsForOwner } from "./resumeHeldAccountEmailOperationsForOwner";

export const syncCurrentAccountContact = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity?.email || identity.emailVerified !== true) {
      throw new Error("A verified account email is required.");
    }

    const ownerId = identity.subject;
    await rateLimiter.limit(ctx, "accountContactSyncByOwner", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "accountContactSyncGlobal", { throws: true });

    const normalizedEmail = normalizeToolLeadEmail(identity.email);
    const now = Date.now();
    const current = await ctx.db
      .query("accountContacts")
      .withIndex("by_owner", (query) => query.eq("ownerId", ownerId))
      .unique();
    const displayName = normalizeClerkAccountName(identity.name);
    const firstName = displayName?.split(" ")[0];
    const emailChanged = Boolean(
      current && current.normalizedEmail !== normalizedEmail,
    );
    const contactFields = {
      deletedAt: undefined,
      displayName,
      emailVerified: true,
      firstName,
      lastClerkEventAt: Math.max(current?.lastClerkEventAt ?? 0, now),
      lastClerkWebhookId: "authenticated-session-sync",
      normalizedEmail,
      primaryEmailId:
        current && !emailChanged
          ? current.primaryEmailId
          : `authenticated:${ownerId}`,
      updatedAt: now,
      ...(emailChanged
        ? {
            emailSuppressedAt: undefined,
            emailSuppressionReason: undefined,
          }
        : {}),
    };

    if (current) {
      await ctx.db.patch(current._id, contactFields);
    } else {
      await ctx.db.insert("accountContacts", {
        ...contactFields,
        createdAt: now,
        ownerId,
      });
    }

    await resumeHeldAccountEmailOperationsForOwner(ctx, { now, ownerId });
    const welcome = await createAccountCreatedCommunication(ctx, {
      now,
      ownerId,
    });

    return {
      emailUpdated: emailChanged,
      synced: true as const,
      welcomeQueued: welcome.created,
    };
  },
});
