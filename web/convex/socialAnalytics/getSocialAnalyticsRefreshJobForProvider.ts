import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { assertOwnerCanPublishSocial } from "../billing/assertOwnerCanPublishSocial";

export const getSocialAnalyticsRefreshJobForProvider = query({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    refreshRunId: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);
    await assertOwnerCanPublishSocial(ctx, args.ownerId, args.now);

    const run = await ctx.db
      .query("socialAnalyticsRefreshRuns")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.refreshRunId),
      )
      .unique();

    if (!run) {
      throw new Error("Analytics refresh not found.");
    }

    let publicationIds: string[];

    try {
      const parsed = JSON.parse(run.publicationIdsJson) as unknown;
      publicationIds =
        Array.isArray(parsed) &&
        parsed.every((value): value is string => typeof value === "string")
          ? parsed
          : [];
    } catch {
      publicationIds = [];
    }

    const documents = await Promise.all(
      publicationIds.map(async (publicationId) => {
        const publication = await ctx.db
          .query("socialExternalPublications")
          .withIndex("by_owner_id", (index) =>
            index.eq("ownerId", args.ownerId).eq("id", publicationId),
          )
          .unique();

        if (!publication) {
          return null;
        }

        const [post, target, account] = await Promise.all([
          ctx.db
            .query("socialPosts")
            .withIndex("by_owner_id", (index) =>
              index.eq("ownerId", args.ownerId).eq("id", publication.postId),
            )
            .unique(),
          ctx.db
            .query("socialPostTargets")
            .withIndex("by_owner_id", (index) =>
              index.eq("ownerId", args.ownerId).eq("id", publication.targetId),
            )
            .unique(),
          ctx.db
            .query("socialAccounts")
            .withIndex("by_owner_id", (index) =>
              index
                .eq("ownerId", args.ownerId)
                .eq("id", publication.socialAccountId),
            )
            .unique(),
        ]);

        if (!post || !target) {
          return null;
        }

        return { account, post, publication, target };
      }),
    );

    return {
      run,
      documents: documents.filter((document) => document !== null),
    };
  },
});
