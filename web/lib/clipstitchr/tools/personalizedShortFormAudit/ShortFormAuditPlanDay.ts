import type { ShortFormAuditDimension } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditDimension";

export type ShortFormAuditPlanDay = {
  action: string;
  day: number;
  dimension: ShortFormAuditDimension;
  title: string;
};
