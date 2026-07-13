import { AdVariantTestPhaseCard } from "@/app/_components/tools/ad-variant-calculator/AdVariantTestPhaseCard";
import type { AdVariantTestPhase } from "@/lib/clipstitchr/tools/adVariantCalculator/AdVariantTestPhase";

type AdVariantTestPlanProps = {
  phases: AdVariantTestPhase[];
};

export function AdVariantTestPlan({ phases }: AdVariantTestPlanProps) {
  return (
    <section className="mt-6 border-t border-border pt-6">
      <h3 className="text-base font-bold text-text-primary">
        A simpler way to test this many ideas
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        The biggest number is not the best starting point. Work through one
        question at a time so you can tell why an ad won.
      </p>
      <ol className="mt-4 grid gap-3">
        {phases.map((phase, index) => (
          <AdVariantTestPhaseCard
            key={phase.title}
            index={index}
            phase={phase}
          />
        ))}
      </ol>
    </section>
  );
}
