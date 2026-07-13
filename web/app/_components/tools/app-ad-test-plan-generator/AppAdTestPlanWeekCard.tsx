import type { AppAdTestPlanWeek } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanWeek";
import { formatAppAdTestPlanUsd } from "@/lib/clipstitchr/tools/appAdTestPlan/formatAppAdTestPlanUsd";

type AppAdTestPlanWeekCardProps = {
  week: AppAdTestPlanWeek;
};

export function AppAdTestPlanWeekCard({ week }: AppAdTestPlanWeekCardProps) {
  return (
    <li className="rounded-lg border border-border bg-surface-muted/45 p-4">
      <p className="text-xs font-bold uppercase text-accent-dark">
        Week {week.weekNumber} · Wave {week.waveNumber}
      </p>
      <p className="mt-2 text-sm font-bold text-text-primary">
        Make {week.variantCount} {week.variantCount === 1 ? "variant" : "variants"}
      </p>
      <p className="mt-1 text-xs leading-5 text-text-secondary">
        {week.waveName}
      </p>
      {week.budgetPerLiveVariant === undefined ? null : (
        <p className="mt-2 text-xs font-semibold text-text-tertiary">
          {formatAppAdTestPlanUsd(week.budgetPerLiveVariant)} even planning
          allocation per live variant
        </p>
      )}
    </li>
  );
}
