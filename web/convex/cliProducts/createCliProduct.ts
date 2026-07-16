import { v } from "convex/values";
import { assignLegacyRecordsToProduct } from "../assignLegacyRecordsToProduct";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getPrimaryProductForOwner } from "../getPrimaryProductForOwner";
import { assertProductLimit } from "../products/assertProductLimit";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";
import { upsertProductCard } from "../upsertProductCard";
import { normalizeCliProductText } from "./normalizeCliProductText";

const productTextMaxLength = 2000;
const productNameMaxLength = 120;

export const createCliProduct = mutation({
  args: {
    audienceDetails: v.string(),
    id: v.string(),
    name: v.string(),
    ownerId: v.string(),
    productDetails: v.string(),
    secret: v.string(),
  },
  handler: async (
    ctx,
    { audienceDetails, id, name, ownerId, productDetails, secret },
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
    const now = new Date().toISOString();

    await assertProductLimit(ctx, ownerId, now);

    const existingPrimaryProduct = await getPrimaryProductForOwner(
      ctx,
      ownerId,
    );
    const productFields = {
      audienceDetails: normalizeCliProductText(
        audienceDetails,
        productTextMaxLength,
      ),
      createdAt: now,
      id,
      inferredPainPoints: [],
      name: normalizedName,
      ownerId,
      productDetails: normalizeCliProductText(
        productDetails,
        productTextMaxLength,
      ),
      updatedAt: now,
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
        updatedAt: now,
      };

      if (existingPreferences) {
        await ctx.db.patch(existingPreferences._id, preferences);
      } else {
        await ctx.db.insert("productPreferences", preferences);
      }

      await assignLegacyRecordsToProduct(ctx, ownerId, id, now);
    }

    return {
      id: productFields.id,
      name: productFields.name,
    };
  },
});
