import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getEmailConfirmationTokenIsAvailable } from "./getEmailConfirmationTokenIsAvailable";
import { validateEmailConfirmationReference } from "./validateEmailConfirmationReference";

export const inspectEmailConfirmationToken = query({
  args: {
    expiresAt: v.number(),
    inspectedAt: v.number(),
    secret: v.string(),
    tokenDigest: v.string(),
    tokenRecordId: v.string(),
  },
  handler: async (ctx, args) => {
    assertRateLimitApiSecret(args.secret);

    if (!validateEmailConfirmationReference(args)) {
      return { status: "unavailable" as const };
    }

    const token = await ctx.db
      .query("emailConfirmationTokens")
      .withIndex("by_token_record_id", (queryBuilder) =>
        queryBuilder.eq("tokenRecordId", args.tokenRecordId),
      )
      .unique();
    const contact = token ? await ctx.db.get(token.contactId) : null;

    return {
      status: getEmailConfirmationTokenIsAvailable({
        contact,
        expiresAt: args.expiresAt,
        inspectedAt: args.inspectedAt,
        token,
        tokenDigest: args.tokenDigest,
      })
        ? ("ready" as const)
        : ("unavailable" as const),
    };
  },
});
