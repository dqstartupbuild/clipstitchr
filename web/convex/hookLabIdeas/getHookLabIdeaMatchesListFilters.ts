import type { Doc } from "../_generated/dataModel";
import type { HookLabIdeaStatus } from "../../lib/clipstitchr/types/HookLabIdeaStatus";

export function getHookLabIdeaMatchesListFilters({
  idea,
  productId,
  statusFilter,
}: {
  idea: Doc<"hookLabIdeas">;
  productId?: string;
  statusFilter: "all" | HookLabIdeaStatus;
}) {
  const statusMatches =
    statusFilter === "all"
      ? idea.status !== "archived"
      : idea.status === statusFilter;
  const productMatches =
    idea.scope === "shared" || Boolean(productId && idea.productId === productId);

  return statusMatches && productMatches;
}
