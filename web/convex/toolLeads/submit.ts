import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { rateLimiter } from "../rateLimiter";
import { toolLeadSourceValidator } from "../validators/toolLeadSource";
import { getToolLeadInputIsValid } from "../../lib/clipstitchr/tools/toolLeads/getToolLeadInputIsValid";
import { normalizeToolLeadEmail } from "../../lib/clipstitchr/tools/toolLeads/normalizeToolLeadEmail";
import { normalizeToolLeadName } from "../../lib/clipstitchr/tools/toolLeads/normalizeToolLeadName";

const clientKeyPattern = /^[a-f0-9]{64}$/;

export const submit = mutation({
  args: {
    clientKey: v.string(),
    email: v.string(),
    name: v.string(),
    secret: v.string(),
    source: toolLeadSourceValidator,
  },
  handler: async (ctx, { clientKey, email, name, secret, source }) => {
    assertRateLimitApiSecret(secret);

    const normalizedInput = {
      email: normalizeToolLeadEmail(email),
      name: normalizeToolLeadName(name),
    };

    if (!clientKeyPattern.test(clientKey)) {
      throw new Error("Invalid client key.");
    }

    if (!getToolLeadInputIsValid(normalizedInput)) {
      throw new Error("Invalid lead details.");
    }

    const { email: normalizedEmail, name: normalizedName } = normalizedInput;

    await rateLimiter.limit(ctx, "toolLeadSubmitByClient", {
      key: clientKey,
      throws: true,
    });
    await rateLimiter.limit(ctx, "toolLeadSubmitByEmail", {
      key: normalizedEmail,
      throws: true,
    });
    await rateLimiter.limit(ctx, "toolLeadSubmitGlobal", {
      throws: true,
    });

    const existingEntry = await ctx.db
      .query("waitlist")
      .withIndex("by_normalized_email", (query) =>
        query.eq("normalizedEmail", normalizedEmail),
      )
      .unique();

    if (!existingEntry) {
      const now = new Date().toISOString();

      await ctx.db.insert("waitlist", {
        name: normalizedName,
        email: normalizedEmail,
        normalizedEmail,
        source,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { accepted: true as const };
  },
});
