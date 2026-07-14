import { ArrowRight } from "lucide-react";
import { PublicToolPaidCtaLink } from "@/app/_components/tools/gates/PublicToolPaidCtaLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

export function AppAdCostPerCreativePricingCta({
  variant,
}: {
  variant: PublicToolGateVariant;
}) {
  return (
    <aside className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="text-base font-bold text-text-primary">
        Turn the source footage you already paid for into more finished ads.
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        ClipStitchr helps paid accounts keep Hook/UGC clips and product demos
        reusable instead of rebuilding every app ad from the beginning.
      </p>
      <PublicToolPaidCtaLink
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="App ad cost per creative calculator"
        contentId="app_ad_cost_per_creative_calculator_pricing"
        contentName="See ClipStitchr plans"
        toolKey="app-ad-cost-per-creative-calculator"
        variant={variant}
      >
        See ClipStitchr plans
        <ArrowRight aria-hidden className="h-4 w-4" />
      </PublicToolPaidCtaLink>
    </aside>
  );
}
