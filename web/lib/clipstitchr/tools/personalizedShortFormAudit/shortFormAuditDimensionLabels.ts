import type { ShortFormAuditDimension } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditDimension";

export const shortFormAuditDimensionLabels: Record<
  ShortFormAuditDimension,
  string
> = {
  assets: "Asset readiness",
  clarity: "Message clarity",
  learning: "Learning loop",
  repeatability: "Repeatable production",
  testing: "Testing discipline",
};
