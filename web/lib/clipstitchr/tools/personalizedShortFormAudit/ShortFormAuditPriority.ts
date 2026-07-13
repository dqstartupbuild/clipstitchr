import type { ShortFormAuditDimension } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditDimension";

export type ShortFormAuditPriority = {
  action: string;
  dimension: ShortFormAuditDimension;
  label: string;
  lostPoints: number;
};
