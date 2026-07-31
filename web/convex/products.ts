import { v } from "convex/values";
import { assignLegacyRecordsToProduct } from "./assignLegacyRecordsToProduct";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { getOwnerHasContent } from "./getOwnerHasContent";
import { getOwnerHasStitches } from "./getOwnerHasStitches";
import { getOwnerHasLegacyProductRecords } from "./getOwnerHasLegacyProductRecords";
import { getPrimaryProductForOwner } from "./getPrimaryProductForOwner";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { deleteProductCard } from "./deleteProductCard";
import { upsertProductCard } from "./upsertProductCard";
import { normalizePostBridgeSocialAccountIds } from "../lib/clipstitchr/utils/normalizePostBridgeSocialAccountIds";
import { assertProductLimit } from "./products/assertProductLimit";
import { disableProductAutomation } from "./products/disableProductAutomation";
import { createInitialProductSocialQueue } from "./productSocialQueues/createInitialProductSocialQueue";

const PRODUCT_TEXT_MAX_LENGTH = 2000;
const PRODUCT_NAME_MAX_LENGTH = 120;
const PRODUCT_WEBSITE_URL_MAX_LENGTH = 2048;
const PRODUCT_EMOTIONAL_NARRATIVE_MAX_LENGTH = 3000;
const INFERRED_PROBLEM_MAX_LENGTH = 300;
const INFERRED_PAIN_POINT_MAX_LENGTH = 160;
const INFERRED_PAIN_POINT_LIMIT = 10;
const CLIPR_HOOK_STYLE_LIMIT = 25;
const CLIPR_HOOK_TEMPLATE_LIMIT = 200;
const CLIPR_FILLER_KEY_MAX_LENGTH = 40;
const CLIPR_FILLER_VALUE_MAX_LENGTH = 120;
const CLIPR_FILLER_VALUE_LIMIT = 16;
const CLIPR_HOOK_STYLE_KEY_MAX_LENGTH = 80;
const PRODUCT_LIST_LIMIT = 100;

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

    const products = await ctx.db
      .query("products")
      .withIndex("by_owner_archived_created", (q) =>
        q.eq("ownerId", ownerId).eq("archivedAt", undefined),
      )
      .order("desc")
      .take(PRODUCT_LIST_LIMIT);

    return products;
  },
});

export const listCards = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("productCards")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(PRODUCT_LIST_LIMIT);
  },
});

export const getSetupState = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const [
      preferences,
      primaryProduct,
      hasContent,
      hasLegacyContent,
      hasStitches,
    ] = await Promise.all([
      ctx.db
        .query("productPreferences")
        .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
        .unique(),
      getPrimaryProductForOwner(ctx, ownerId),
      getOwnerHasContent(ctx, ownerId),
      getOwnerHasLegacyProductRecords(ctx, ownerId),
      getOwnerHasStitches(ctx, ownerId),
    ]);
    const onboardingCompletedAt = preferences?.onboardingCompletedAt;
    const isOnboardingComplete = Boolean(onboardingCompletedAt || hasStitches);

    return {
      hasContent,
      hasLegacyContent,
      hasStitches,
      isOnboardingComplete,
      onboardingCompletedAt,
      primaryProductId: primaryProduct?.id,
      requiresProductSetup: hasContent && !primaryProduct,
      requiresOnboarding: !isOnboardingComplete,
    };
  },
});

export const create = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    productDetails: v.string(),
    audienceDetails: v.string(),
    emotionalNarrative: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
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
      emotionalNarrative,
      websiteUrl,
      inferredProblem,
      inferredPainPoints,
      eligibleCliprHookStyleKeys,
      eligibleCliprHookTemplateIds,
      cliprPlaceholderFillers,
      preferredCliprHookStyleKey,
    },
  ) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const now = new Date().toISOString();
    const normalizedName = normalizeText(name, PRODUCT_NAME_MAX_LENGTH);

    if (!normalizedName) {
      throw new Error("Product name is required.");
    }

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });
    await assertProductLimit(ctx, ownerId, now);

    const existingPrimaryProduct = await getPrimaryProductForOwner(
      ctx,
      ownerId,
    );

    const productFields = {
      ownerId,
      id,
      name: normalizedName,
      productDetails: normalizeText(productDetails, PRODUCT_TEXT_MAX_LENGTH),
      audienceDetails: normalizeText(audienceDetails, PRODUCT_TEXT_MAX_LENGTH),
      emotionalNarrative: emotionalNarrative
        ? normalizeText(
            emotionalNarrative,
            PRODUCT_EMOTIONAL_NARRATIVE_MAX_LENGTH,
          )
        : undefined,
      websiteUrl: websiteUrl
        ? normalizeText(websiteUrl, PRODUCT_WEBSITE_URL_MAX_LENGTH)
        : undefined,
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
      createdAt: now,
      updatedAt: now,
    };
    const productId = await ctx.db.insert("products", productFields);
    await upsertProductCard(ctx, productFields);
    await createInitialProductSocialQueue(ctx, ownerId, id, now);

    if (!existingPrimaryProduct) {
      const existingPreferences = await ctx.db
        .query("productPreferences")
        .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
        .unique();
      const preferences = {
        ownerId,
        defaultProductId: id,
        updatedAt: now,
      };

      if (existingPreferences) {
        await ctx.db.patch(existingPreferences._id, preferences);
      } else {
        await ctx.db.insert("productPreferences", preferences);
      }

      await assignLegacyRecordsToProduct(ctx, ownerId, id, now);
    }

    return productId;
  },
});

export const assignLegacyContentToPrimary = mutation({
  args: {
    updatedAt: v.string(),
  },
  handler: async (ctx, { updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const primaryProduct = await getPrimaryProductForOwner(ctx, ownerId);

    if (!primaryProduct) {
      return {
        updatedCount: 0,
      };
    }

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    return {
      updatedCount: await assignLegacyRecordsToProduct(
        ctx,
        ownerId,
        primaryProduct.id,
        updatedAt,
      ),
    };
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    productDetails: v.string(),
    audienceDetails: v.string(),
    emotionalNarrative: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
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
      emotionalNarrative,
      websiteUrl,
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

    const productPatch = {
      name: normalizedName,
      productDetails: normalizeText(productDetails, PRODUCT_TEXT_MAX_LENGTH),
      audienceDetails: normalizeText(audienceDetails, PRODUCT_TEXT_MAX_LENGTH),
      emotionalNarrative: emotionalNarrative
        ? normalizeText(
            emotionalNarrative,
            PRODUCT_EMOTIONAL_NARRATIVE_MAX_LENGTH,
          )
        : undefined,
      websiteUrl: websiteUrl
        ? normalizeText(websiteUrl, PRODUCT_WEBSITE_URL_MAX_LENGTH)
        : undefined,
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
    };

    await ctx.db.patch(product._id, productPatch);
    await upsertProductCard(ctx, { ...product, ...productPatch });
  },
});

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    const product = await ctx.db
      .query("products")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    return product?.archivedAt ? null : product;
  },
});

export const updatePostBridgeSocialAccountIds = mutation({
  args: {
    id: v.string(),
    socialAccountIds: v.array(v.number()),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, socialAccountIds, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

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
      postBridgeSocialAccountIds:
        normalizePostBridgeSocialAccountIds(socialAccountIds),
      updatedAt,
    });
    const updatedProduct = await ctx.db.get(product._id);

    if (updatedProduct) {
      await upsertProductCard(ctx, updatedProduct);
    }
  },
});

export const remove = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
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

    const updatedAt = new Date().toISOString();

    await ctx.db.patch(product._id, {
      archivedAt: updatedAt,
      updatedAt,
    });
    await deleteProductCard(ctx, product);
    await disableProductAutomation(ctx, ownerId, product.id, updatedAt);

    return { ...product, archivedAt: updatedAt, updatedAt };
  },
});
