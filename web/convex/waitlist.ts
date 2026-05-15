import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { name, email }) => {
    const normalizedName = normalizeName(name);
    const normalizedEmail = normalizeEmail(email);

    if (normalizedName.length < 2 || normalizedName.length > 120) {
      throw new Error("Enter a name between 2 and 120 characters.");
    }

    if (
      normalizedEmail.length < 3 ||
      normalizedEmail.length > 320 ||
      !emailPattern.test(normalizedEmail)
    ) {
      throw new Error("Enter a valid email address.");
    }

    const emailLimit = await rateLimiter.limit(ctx, "waitlistSubmitByEmail", {
      key: normalizedEmail,
    });
    const globalLimit = await rateLimiter.limit(ctx, "waitlistSubmitGlobal");

    if (!emailLimit.ok || !globalLimit.ok) {
      throw new Error("Too many waitlist submissions. Try again later.");
    }

    const now = new Date().toISOString();
    const existingEntry = await ctx.db
      .query("waitlist")
      .withIndex("by_normalized_email", (q) =>
        q.eq("normalizedEmail", normalizedEmail),
      )
      .unique();

    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, {
        name: normalizedName,
        email: normalizedEmail,
        updatedAt: now,
      });

      return { status: "updated" };
    }

    await ctx.db.insert("waitlist", {
      name: normalizedName,
      email: normalizedEmail,
      normalizedEmail,
      source: "sign-up-page",
      createdAt: now,
      updatedAt: now,
    });

    return { status: "created" };
  },
});
