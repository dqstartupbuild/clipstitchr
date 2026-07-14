import type { ThirtyDayContentAction } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/ThirtyDayContentAction";

type ThirtyDayContentPlanActionCardProps = {
  action: ThirtyDayContentAction;
};

export function ThirtyDayContentPlanActionCard({
  action,
}: ThirtyDayContentPlanActionCardProps) {
  return (
    <li className="marketing-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-accent-dark">
          Day {action.dayNumber} · {action.kind}
        </p>
        <time className="text-xs font-semibold text-text-tertiary">
          {action.date}
        </time>
      </div>
      <h3 className="mt-2 text-lg font-bold text-text-primary">
        {action.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {action.detail}
      </p>
      <p className="mt-3 text-xs font-semibold text-text-tertiary">
        Source needed: {action.asset}
      </p>
    </li>
  );
}
