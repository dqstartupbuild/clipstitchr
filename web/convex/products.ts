import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";

const PRODUCT_TEXT_MAX_LENGTH = 2000;
const PRODUCT_NAME_MAX_LENGTH = 120;
const INFERRED_PROBLEM_MAX_LENGTH = 300;
const INFERRED_PAIN_POINT_MAX_LENGTH = 160;
const INFERRED_PAIN_POINT_LIMIT = 10;
const CLIPR_HOOK_STYLE_LIMIT = 25;
const CLIPR_HOOK_TEMPLATE_LIMIT = 200;
const CLIPR_FILLER_KEY_MAX_LENGTH = 40;
const CLIPR_FILLER_VALUE_MAX_LENGTH = 120;
const CLIPR_FILLER_VALUE_LIMIT = 16;
const CLIPR_HOOK_STYLE_KEY_MAX_LENGTH = 80;

function normalizeText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function normalizeTextArray(
  values: string[] | undefined,
  limit: number,
  maxLength: number,
) {
  return Array.from(
    new Set((values ?? []).map((value) => normalizeText(value, maxLength))),
  )
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeFillers(fillers: Record<string, string[]> | undefined) {
  if (!fillers) {
    return undefined;
  }

  const normalizedFillers = Object.fromEntries(
    Object.entries(fillers)
      .map(([key, values]) => [
        normalizeText(key, CLIPR_FILLER_KEY_MAX_LENGTH),
        normalizeTextArray(
          values,
          CLIPR_FILLER_VALUE_LIMIT,
          CLIPR_FILLER_VALUE_MAX_LENGTH,
        ),
      ])
      .filter(([key, values]) => key && values.length),
  );

  return Object.keys(normalizedFillers).length ? normalizedFillers : undefined;
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
    eligibleCliprHookStyleKeys: v.optional(v.array(v.string())),
    eligibleCliprHookTemplateIds: v.optional(v.array(v.string())),
    cliprPlaceholderFillers: v.optional(
      v.record(v.string(), v.array(v.string())),
    ),
    preferredCliprHookStyleKey: v.optional(v.string()),
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
      eligibleCliprHookStyleKeys,
      eligibleCliprHookTemplateIds,
      cliprPlaceholderFillers,
      preferredCliprHookStyleKey,
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
      eligibleCliprHookStyleKeys: normalizeTextArray(
        eligibleCliprHookStyleKeys,
        CLIPR_HOOK_STYLE_LIMIT,
        80,
      ),
      eligibleCliprHookTemplateIds: normalizeTextArray(
        eligibleCliprHookTemplateIds,
        CLIPR_HOOK_TEMPLATE_LIMIT,
        80,
      ),
      cliprPlaceholderFillers: normalizeFillers(cliprPlaceholderFillers),
      preferredCliprHookStyleKey: preferredCliprHookStyleKey
        ? normalizeText(
            preferredCliprHookStyleKey,
            CLIPR_HOOK_STYLE_KEY_MAX_LENGTH,
          )
        : undefined,
      createdAt,
      updatedAt,
    });
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    productDetails: v.string(),
    audienceDetails: v.string(),
    inferredProblem: v.optional(v.string()),
    inferredPainPoints: v.array(v.string()),
    eligibleCliprHookStyleKeys: v.optional(v.array(v.string())),
    eligibleCliprHookTemplateIds: v.optional(v.array(v.string())),
    cliprPlaceholderFillers: v.optional(
      v.record(v.string(), v.array(v.string())),
    ),
    preferredCliprHookStyleKey: v.optional(v.string()),
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
      eligibleCliprHookStyleKeys,
      eligibleCliprHookTemplateIds,
      cliprPlaceholderFillers,
      preferredCliprHookStyleKey,
      updatedAt,
    },
  ) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const normalizedName = normalizeText(name, PRODUCT_NAME_MAX_LENGTH);

    if (!normalizedName) {
      throw new Error("Product name is required.");
    }

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const product = await ctx.db
      .query("products")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!product) {
      throw new Error("Product not found.");
    }

    await ctx.db.patch(product._id, {
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
      eligibleCliprHookStyleKeys: normalizeTextArray(
        eligibleCliprHookStyleKeys,
        CLIPR_HOOK_STYLE_LIMIT,
        80,
      ),
      eligibleCliprHookTemplateIds: normalizeTextArray(
        eligibleCliprHookTemplateIds,
        CLIPR_HOOK_TEMPLATE_LIMIT,
        80,
      ),
      cliprPlaceholderFillers: normalizeFillers(cliprPlaceholderFillers),
      preferredCliprHookStyleKey: preferredCliprHookStyleKey
        ? normalizeText(
            preferredCliprHookStyleKey,
            CLIPR_HOOK_STYLE_KEY_MAX_LENGTH,
          )
        : undefined,
      updatedAt,
    });
  },
});

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("products")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();
  },
});

export const remove = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexRecordDelete", {
      key: ownerId,
      throws: true,
    });

    const product = await ctx.db
      .query("products")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!product) {
      return null;
    }

    const preferences = await ctx.db
      .query("productPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .unique();

    if (preferences?.defaultProductId === product.id) {
      await ctx.db.patch(preferences._id, {
        defaultProductId: undefined,
        updatedAt: new Date().toISOString(),
      });
    }

    await ctx.db.delete(product._id);
    return product;
  },
});
