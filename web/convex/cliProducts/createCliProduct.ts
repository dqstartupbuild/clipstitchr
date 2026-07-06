import { v } from "convex/values";
import { assignLegacyRecordsToProduct } from "../assignLegacyRecordsToProduct";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getPrimaryProductForOwner } from "../getPrimaryProductForOwner";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";
import { upsertProductCard } from "../upsertProductCard";

const productTextMaxLength = 2000;
const productNameMaxLength = 120;

function normalizeCliProductText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

export const createCliProduct = mutation({
  args: {
    audienceDetails: v.string(),
    createdAt: v.string(),
    id: v.string(),
    name: v.string(),
    ownerId: v.string(),
    productDetails: v.string(),
    secret: v.string(),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      audienceDetails,
      createdAt,
      id,
      name,
      ownerId,
      productDetails,
      secret,
      updatedAt,
    },
  ) => {
    assertRateLimitApiSecret(secret);

    const normalizedName = normalizeCliProductText(name, productNameMaxLength);

    if (!normalizedName) {
      throw new Error("Product name is required.");
    }

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

    const existingPrimaryProduct = await getPrimaryProductForOwner(
      ctx,
      ownerId,
    );
    const productFields = {
      audienceDetails: normalizeCliProductText(
        audienceDetails,
        productTextMaxLength,
      ),
      createdAt,
      id,
      inferredPainPoints: [],
      name: normalizedName,
      ownerId,
      productDetails: normalizeCliProductText(
        productDetails,
        productTextMaxLength,
      ),
      updatedAt,
    };
    await ctx.db.insert("products", productFields);

    await upsertProductCard(ctx, productFields);

    if (!existingPrimaryProduct) {
      const existingPreferences = await ctx.db
        .query("productPreferences")
        .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
        .unique();
      const preferences = {
        defaultProductId: id,
        ownerId,
        updatedAt,
      };

      if (existingPreferences) {
        await ctx.db.patch(existingPreferences._id, preferences);
      } else {
        await ctx.db.insert("productPreferences", preferences);
      }

      await assignLegacyRecordsToProduct(ctx, ownerId, id, updatedAt);
    }

    return {
      id: productFields.id,
      name: productFields.name,
    };
  },
});
