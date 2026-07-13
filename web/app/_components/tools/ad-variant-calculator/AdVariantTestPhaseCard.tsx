import type { AdVariantTestPhase } from "@/lib/clipstitchr/tools/adVariantCalculator/AdVariantTestPhase";

type AdVariantTestPhaseCardProps = {
  index: number;
  phase: AdVariantTestPhase;
};

export function AdVariantTestPhaseCard({
  index,
  phase,
}: AdVariantTestPhaseCardProps) {
  return (
    <li className="flex gap-3 rounded-lg border border-border bg-surface p-4">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent-dark">
        {index + 1}
      </span>
      <div className="min-w-0">
        <h4 className="text-sm font-bold text-text-primary">{phase.title}</h4>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          {phase.description}
        </p>
      </div>
    </li>
  );
}
