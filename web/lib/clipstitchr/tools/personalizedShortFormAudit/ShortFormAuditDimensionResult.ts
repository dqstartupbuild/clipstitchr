import type { ShortFormAuditDimension } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditDimension";

export type ShortFormAuditDimensionResult = {
  dimension: ShortFormAuditDimension;
  label: string;
  lostPoints: number;
  score: number;
};
