import type { ShortFormAuditPlanDay } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditPlanDay";
import { shortFormAuditDimensionLabels } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/shortFormAuditDimensionLabels";

type ShortFormAuditPlanDayCardProps = {
  planDay: ShortFormAuditPlanDay;
};

export function ShortFormAuditPlanDayCard({
  planDay,
}: ShortFormAuditPlanDayCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface-elevated p-4">
      <p className="text-xs font-bold uppercase text-accent-dark">
        Day {planDay.day} · {shortFormAuditDimensionLabels[planDay.dimension]}
      </p>
      <h4 className="mt-2 text-base font-bold text-text-primary">
        {planDay.title}
      </h4>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {planDay.action}
      </p>
    </article>
  );
}
