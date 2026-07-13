import type { ShortFormAuditPlanDay } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditPlanDay";
import type { ShortFormAuditPriority } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditPriority";
import { shortFormAuditPlanDefinitions } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/shortFormAuditPlanDefinitions";

export function createPersonalizedShortFormAuditPlan(
  priorities: readonly ShortFormAuditPriority[],
): ShortFormAuditPlanDay[] {
  return shortFormAuditPlanDefinitions.map((day) => {
    const priority = priorities.find(
      (candidate) => candidate.dimension === day.dimension,
    );

    return {
      ...day,
      action: priority
        ? `${day.action} Your audit focus: ${priority.action}`
        : `${day.action} This dimension is already strong, so use the day to document what works.`,
    };
  });
}
