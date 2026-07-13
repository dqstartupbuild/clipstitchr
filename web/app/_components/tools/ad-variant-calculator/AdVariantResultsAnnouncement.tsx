import type { AdVariantCalculatorResult } from "@/lib/clipstitchr/tools/adVariantCalculator/AdVariantCalculatorResult";

type AdVariantResultsAnnouncementProps = {
  result: AdVariantCalculatorResult;
};

export function AdVariantResultsAnnouncement({
  result,
}: AdVariantResultsAnnouncementProps) {
  return (
    <p className="sr-only" aria-atomic="true" aria-live="polite">
      Updated plan: {result.pairingCount} pairings, {" "}
      {result.possibleCombinationCount} possible combinations, and {" "}
      {result.practicalFirstBatchCount} ads in the practical first batch.
    </p>
  );
}
