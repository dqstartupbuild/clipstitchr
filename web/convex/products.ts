import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";

const PRODUCT_TEXT_MAX_LENGTH = 2000;
const PRODUCT_NAME_MAX_LENGTH = 120;
const INFERRED_PROBLEM_MAX_LENGTH = 300;
const INFERRED_PAIN_POINT_MAX_LENGTH = 160;
const INFERRED_PAIN_POINT_LIMIT = 8;

function normalizeText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("products")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    productDetails: v.string(),
    audienceDetails: v.string(),
    inferredProblem: v.optional(v.string()),
    inferredPainPoints: v.array(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      id,
      name,
      productDetails,
      audienceDetails,
      inferredProblem,
      inferredPainPoints,
      createdAt,
      updatedAt,
    },
  ) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const normalizedName = normalizeText(name, PRODUCT_NAME_MAX_LENGTH);

    if (!normalizedName) {
      throw new Error("Product name is required.");
    }

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

    return await ctx.db.insert("products", {
      ownerId,
      id,
      name: normalizedName,
      productDetails: normalizeText(productDetails, PRODUCT_TEXT_MAX_LENGTH),
      audienceDetails: normalizeText(audienceDetails, PRODUCT_TEXT_MAX_LENGTH),
      inferredProblem: inferredProblem
        ? normalizeText(inferredProblem, INFERRED_PROBLEM_MAX_LENGTH)
        : undefined,
      inferredPainPoints: inferredPainPoints
        .map((painPoint) =>
          normalizeText(painPoint, INFERRED_PAIN_POINT_MAX_LENGTH),
        )
        .filter(Boolean)
        .slice(0, INFERRED_PAIN_POINT_LIMIT),
      createdAt,
      updatedAt,
    });
  },
});
