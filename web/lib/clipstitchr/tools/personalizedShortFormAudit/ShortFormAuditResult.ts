import type { ShortFormAuditDimensionResult } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditDimensionResult";
import type { ShortFormAuditPlanDay } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditPlanDay";
import type { ShortFormAuditPriority } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditPriority";

export type ShortFormAuditResult = {
  assetGaps: string[];
  dimensions: ShortFormAuditDimensionResult[];
  overallScore: number;
  plan: ShortFormAuditPlanDay[];
  priorities: ShortFormAuditPriority[];
  scoreLabel: string;
};
