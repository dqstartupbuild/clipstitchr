import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const digestPattern = /^[a-f0-9]{64}$/;

export async function createCourseAccessSession(
  ctx: MutationCtx,
  args: {
    contactId: Id<"marketingContacts">;
    expiresAt: number;
    issuedAt: number;
    tokenHash: string;
  },
) {
  if (
    !digestPattern.test(args.tokenHash) ||
    !Number.isFinite(args.issuedAt) ||
    !Number.isFinite(args.expiresAt) ||
    args.expiresAt <= args.issuedAt
  ) {
    throw new Error("Invalid course access session.");
  }

  const duplicate = await ctx.db
    .query("courseAccessSessions")
    .withIndex("by_token_hash", (query) => query.eq("tokenHash", args.tokenHash))
    .unique();

  if (duplicate) throw new Error("Invalid course access session.");

  return await ctx.db.insert("courseAccessSessions", {
    contactId: args.contactId,
    tokenHash: args.tokenHash,
    issuedAt: args.issuedAt,
    expiresAt: args.expiresAt,
    lastUsedAt: args.issuedAt,
  });
}
