import { AdVariantMetricCard } from "@/app/_components/tools/ad-variant-calculator/AdVariantMetricCard";
import { AdVariantPricingCta } from "@/app/_components/tools/ad-variant-calculator/AdVariantPricingCta";
import { AdVariantResultsAnnouncement } from "@/app/_components/tools/ad-variant-calculator/AdVariantResultsAnnouncement";
import { AdVariantTestPlan } from "@/app/_components/tools/ad-variant-calculator/AdVariantTestPlan";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { AdVariantCalculatorResult } from "@/lib/clipstitchr/tools/adVariantCalculator/AdVariantCalculatorResult";

type AdVariantCalculatorResultsProps = {
  result: AdVariantCalculatorResult;
};

export function AdVariantCalculatorResults({
  result,
}: AdVariantCalculatorResultsProps) {
  return (
    <Panel className="p-5 md:p-6">
      <AdVariantResultsAnnouncement result={result} />
      <PanelHeader
        eyebrow="Your test plan"
        title="Here is what those assets can become."
        description="Use the full number for planning. Use the first batch for actually learning what works."
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <AdVariantMetricCard
          label="UGC + demo pairings"
          value={result.pairingCount}
          description="Every UGC clip matched with every product demo."
        />
        <AdVariantMetricCard
          label="Possible test combinations"
          value={result.possibleCombinationCount}
          description="Pairings multiplied by hooks and calls to action."
        />
        <AdVariantMetricCard
          label="Practical first batch"
          value={result.practicalFirstBatchCount}
          description="One selected demo paired with up to 20 UGC clips."
        />
      </div>
      <AdVariantTestPlan phases={result.testPhases} />
      <AdVariantPricingCta />
    </Panel>
  );
}
