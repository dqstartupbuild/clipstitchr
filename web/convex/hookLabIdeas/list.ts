import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";
import { hookLabIdeaScopeFilterValidator } from "../validators/hookLabIdeaScopeFilter";
import { hookLabIdeaStatusFilterValidator } from "../validators/hookLabIdeaStatusFilter";
import { getHookLabIdeaMatchesListFilters } from "./getHookLabIdeaMatchesListFilters";

const MAX_PAGE_SIZE = 24;

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    productId: v.optional(v.string()),
    scopeFilter: v.optional(hookLabIdeaScopeFilterValidator),
    searchQuery: v.optional(v.string()),
    statusFilter: v.optional(hookLabIdeaStatusFilterValidator),
  },
  handler: async (
    ctx,
    {
      paginationOpts,
      productId: requestedProductId,
      scopeFilter = "current",
      searchQuery,
      statusFilter = "all",
    },
  ) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const productId = requestedProductId?.trim() || undefined;
    const normalizedSearch = searchQuery?.trim().toLowerCase().slice(0, 120);
    const pageSize = Math.max(
      1,
      Math.min(MAX_PAGE_SIZE, Math.floor(paginationOpts.numItems)),
    );

    if (normalizedSearch) {
      const result = await ctx.db
        .query("hookLabIdeas")
        .withSearchIndex("search_ideas", (search) =>
          search.search("searchText", normalizedSearch).eq("ownerId", ownerId),
        )
        .paginate({ ...paginationOpts, numItems: pageSize });

      return {
        ...result,
        page: result.page.filter((idea) => {
          if (
            !getHookLabIdeaMatchesListFilters({ idea, productId, statusFilter })
          ) {
            return false;
          }

          if (scopeFilter === "shared") {
            return idea.scope === "shared";
          }

          if (scopeFilter === "product") {
            return idea.scope === "product" && idea.productId === productId;
          }

          return scopeFilter === "all" || idea.scope === "shared" || idea.productId === productId;
        }),
      };
    }

    if (scopeFilter === "all") {
      const result = await ctx.db
        .query("hookLabIdeas")
        .withIndex("by_owner_sort", (query) => query.eq("ownerId", ownerId))
        .order("desc")
        .paginate({ ...paginationOpts, numItems: pageSize });

      return {
        ...result,
        page: result.page.filter((idea) =>
          statusFilter === "all"
            ? idea.status !== "archived"
            : idea.status === statusFilter,
        ),
      };
    }

    if (scopeFilter === "shared") {
      const result = await ctx.db
        .query("hookLabIdeas")
        .withIndex("by_owner_scope_sort", (query) =>
          query.eq("ownerId", ownerId).eq("scope", "shared"),
        )
        .order("desc")
        .paginate({ ...paginationOpts, numItems: pageSize });

      return {
        ...result,
        page: result.page.filter((idea) =>
          statusFilter === "all"
            ? idea.status !== "archived"
            : idea.status === statusFilter,
        ),
      };
    }

    if (!productId) {
      return {
        continueCursor: "",
        isDone: true,
        page: [],
      };
    }

    if (scopeFilter === "product") {
      const result = await ctx.db
        .query("hookLabIdeas")
        .withIndex("by_owner_product_sort", (query) =>
          query.eq("ownerId", ownerId).eq("productId", productId),
        )
        .order("desc")
        .paginate({ ...paginationOpts, numItems: pageSize });

      return {
        ...result,
        page: result.page.filter((idea) =>
          statusFilter === "all"
            ? idea.status !== "archived"
            : idea.status === statusFilter,
        ),
      };
    }

    const cursor = paginationOpts.cursor || "\uffff";
    const [sharedIdeas, productIdeas] = await Promise.all([
      ctx.db
        .query("hookLabIdeas")
        .withIndex("by_owner_scope_sort", (query) =>
          query
            .eq("ownerId", ownerId)
            .eq("scope", "shared")
            .lt("sortKey", cursor),
        )
        .order("desc")
        .take(pageSize + 1),
      ctx.db
        .query("hookLabIdeas")
        .withIndex("by_owner_product_sort", (query) =>
          query
            .eq("ownerId", ownerId)
            .eq("productId", productId)
            .lt("sortKey", cursor),
        )
        .order("desc")
        .take(pageSize + 1),
    ]);
    const merged = [...sharedIdeas, ...productIdeas].sort((left, right) =>
      right.sortKey.localeCompare(left.sortKey),
    );
    const scannedPage = merged.slice(0, pageSize);
    const page = scannedPage.filter((idea) =>
      getHookLabIdeaMatchesListFilters({ idea, productId, statusFilter }),
    );
    const continueCursor = scannedPage.at(-1)?.sortKey ?? cursor;

    return {
      continueCursor,
      isDone: scannedPage.length < pageSize,
      page,
    };
  },
});
