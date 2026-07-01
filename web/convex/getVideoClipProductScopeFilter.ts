import type { ExpressionOrValue, FilterBuilder } from "convex/server";
import type { DataModel } from "./_generated/dataModel";

type VideoClipFilterBuilder = Pick<
  FilterBuilder<DataModel["videoClipCards"]>,
  "and" | "eq" | "field" | "or"
>;

export function getVideoClipProductScopeFilter(
  q: VideoClipFilterBuilder,
  productFilterId: string,
): ExpressionOrValue<boolean> {
  return q.or(
    q.eq(q.field("productId"), productFilterId),
    q.and(
      q.eq(q.field("clipType"), "ugc"),
      q.eq(q.field("cliprMetadata"), undefined),
      q.eq(q.field("swaprMetadata"), undefined),
    ),
  );
}
