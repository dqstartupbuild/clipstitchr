import { v } from "convex/values";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { query } from "../_generated/server";

export const getInputForProvider = query({
  args: {
    id: v.string(),
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { id, ownerId, secret }) => {
    assertProviderWorkerSecret(secret);

    const variant = await ctx.db
      .query("hookLabIdeaVariants")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id),
      )
      .unique();

    if (
      !variant ||
      variant.status === "completed" ||
      variant.status === "failed"
    ) {
      return null;
    }

    const [use, idea, product] = await Promise.all([
      ctx.db
        .query("hookLabIdeaUses")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", ownerId).eq("id", variant.useId),
        )
        .unique(),
      ctx.db
        .query("hookLabIdeas")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", ownerId).eq("id", variant.ideaId),
        )
        .unique(),
      ctx.db
        .query("products")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", ownerId).eq("id", variant.productId),
        )
        .unique(),
    ]);

    if (!use || !idea || !product) {
      return null;
    }

    const [avatar, demoClip] = await Promise.all([
      ctx.db
        .query("avatars")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", ownerId).eq("id", use.defaultAvatarId),
        )
        .unique(),
      ctx.db
        .query("videoClips")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", ownerId).eq("id", use.defaultDemoClipId),
        )
        .unique(),
    ]);

    if (!avatar || !demoClip) {
      return null;
    }

    const [avatarPhotos, siblingVariants] = await Promise.all([
      ctx.db
        .query("photoAssets")
        .withIndex("by_owner_avatar_created", (index) =>
          index.eq("ownerId", ownerId).eq("avatarId", avatar.id),
        )
        .order("desc")
        .take(20),
      ctx.db
        .query("hookLabIdeaVariants")
        .withIndex("by_owner_use_variant", (index) =>
          index.eq("ownerId", ownerId).eq("useId", variant.useId),
        )
        .take(5),
    ]);
    const avatarPhoto = avatarPhotos.find(
      (photo) => !photo.productId || photo.productId === product.id,
    );

    if (!avatarPhoto) {
      return null;
    }

    return {
      avatar,
      avatarPhoto,
      demoClip,
      idea,
      product,
      siblingHooks: siblingVariants.flatMap((sibling) =>
        sibling.id !== variant.id && sibling.generatedHook
          ? [sibling.generatedHook]
          : [],
      ),
      use,
      variant,
    };
  },
});
