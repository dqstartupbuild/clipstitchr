import type { ThirtyDayContentAction } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/ThirtyDayContentAction";

export function formatThirtyDayContentPlanMarkdown(
  actions: readonly ThirtyDayContentAction[],
) {
  return [
    "# 30-Day App Content Plan",
    "",
    ...actions.flatMap((action) => [
      `## Day ${action.dayNumber} — ${action.date}`,
      `**${action.kind.toUpperCase()}: ${action.title}**`,
      "",
      action.detail,
      "",
      `Source needed: ${action.asset}`,
      "",
    ]),
  ]
    .join("\n")
    .trim();
}
