import type { ShortFormAuditDimension } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditDimension";

export type ShortFormAuditQuestion = {
  action: string;
  assetGap?: string;
  dimension: ShortFormAuditDimension;
  id: string;
  prompt: string;
};
