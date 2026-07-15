import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const digestPattern = /^[a-f0-9]{64}$/;

export async function getValidCourseAccessSession(
  ctx: MutationCtx,
  args: {
    accessedAt: number;
    expectedContactId?: Id<"marketingContacts">;
    tokenHash: string;
  },
) {
  if (!digestPattern.test(args.tokenHash) || !Number.isFinite(args.accessedAt)) {
    return null;
  }

  const session = await ctx.db
    .query("courseAccessSessions")
    .withIndex("by_token_hash", (query) => query.eq("tokenHash", args.tokenHash))
    .unique();

  if (
    !session ||
    session.revokedAt !== undefined ||
    session.expiresAt <= args.accessedAt ||
    (args.expectedContactId !== undefined &&
      session.contactId !== args.expectedContactId)
  ) {
    return null;
  }

  const contact = await ctx.db.get(session.contactId);

  if (!contact || contact.deletionStatus === "privacyDeleted") return null;

  await ctx.db.patch(session._id, { lastUsedAt: args.accessedAt });

  return { contact, session };
}
