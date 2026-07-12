import type { QueryCtx } from "../_generated/server";

const HOOK_LAB_PROMPT_MEMORY_CANDIDATE_LIMIT = 24;
const HOOK_LAB_PROMPT_MEMORY_LIMIT = 8;

export async function getHookLabPromptBlueprints(
  ctx: Pick<QueryCtx, "db">,
  ownerId: string,
  productId: string,
) {
  const [productIdeas, sharedIdeas] = await Promise.all([
    ctx.db
      .query("hookLabIdeas")
      .withIndex("by_owner_product_created", (query) =>
        query.eq("ownerId", ownerId).eq("productId", productId),
      )
      .order("desc")
      .take(HOOK_LAB_PROMPT_MEMORY_CANDIDATE_LIMIT),
    ctx.db
      .query("hookLabIdeas")
      .withIndex("by_owner_scope_created", (query) =>
        query.eq("ownerId", ownerId).eq("scope", "shared"),
      )
      .order("desc")
      .take(HOOK_LAB_PROMPT_MEMORY_CANDIDATE_LIMIT),
  ]);
  const seenIds = new Set<string>();

  return [...productIdeas, ...sharedIdeas]
    .filter((idea) => {
      if (
        seenIds.has(idea.id) ||
        idea.status !== "ready" ||
        !idea.textBlueprint ||
        idea.archivedAt
      ) {
        return false;
      }

      seenIds.add(idea.id);
      return true;
    })
    .sort((left, right) => {
      const scopeDifference =
        Number(right.productId === productId) -
        Number(left.productId === productId);

      if (scopeDifference !== 0) {
        return scopeDifference;
      }

      if (left.useCount !== right.useCount) {
        return right.useCount - left.useCount;
      }

      return (right.lastUsedAt ?? right.updatedAt).localeCompare(
        left.lastUsedAt ?? left.updatedAt,
      );
    })
    .slice(0, HOOK_LAB_PROMPT_MEMORY_LIMIT)
    .map((idea) => idea.textBlueprint!);
}
