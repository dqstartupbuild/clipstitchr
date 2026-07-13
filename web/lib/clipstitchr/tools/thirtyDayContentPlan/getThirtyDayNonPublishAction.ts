import type { ThirtyDayContentAction } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/ThirtyDayContentAction";
import type { ThirtyDayContentActionKind } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/ThirtyDayContentActionKind";
import type { ThirtyDayContentPlanInput } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/ThirtyDayContentPlanInput";

type ThirtyDayNonPublishAction = Pick<
  ThirtyDayContentAction,
  "asset" | "detail" | "kind" | "title"
>;

export function getThirtyDayNonPublishAction(
  input: ThirtyDayContentPlanInput,
  nonPublishIndex: number,
): ThirtyDayNonPublishAction {
  const kinds: readonly ThirtyDayContentActionKind[] = [
    "production",
    "repurpose",
    "review",
    "production",
  ];
  const kind = kinds[nonPublishIndex % kinds.length] ?? "production";

  if (kind === "production") {
    return {
      asset: input.hasDemo
        ? "one clean product-demo source"
        : "one useful source clip",
      kind,
      title: "Capture one reusable source",
      detail:
        "Record one clean opening, action, or app payoff as an individual file with quiet handles and no baked-in text or music.",
    };
  }

  if (kind === "repurpose") {
    return {
      asset: "one recent post or source clip",
      kind,
      title: "Repurpose one useful idea",
      detail:
        "Keep the product fact the same, then change the opening, crop, caption emphasis, or channel context without inventing a new claim.",
    };
  }

  return {
    asset: "notes from the latest posts",
    kind,
    title: "Review what the content actually taught",
    detail:
      "Record what was published, what viewers could understand, which source footage stayed reusable, and one controlled follow-up question.",
  };
}
