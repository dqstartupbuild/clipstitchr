import { ArrowRight } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function AppAdBreakEvenPricingCta() {
  return (
    <aside className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="text-base font-bold text-text-primary">
        Know the target. Make the creatives you need to test it.
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        ClipStitchr helps paid accounts turn reusable Hook/UGC clips and app
        demos into finished test creatives. It does not manage ad spend or
        guarantee acquisition results.
      </p>
      <TrackedButtonLink
        href="/pricing"
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="App ad break-even calculator"
        contentId="app_ad_break_even_calculator_pricing"
        contentName="See ClipStitchr plans"
      >
        See ClipStitchr plans
        <ArrowRight aria-hidden className="h-4 w-4" />
      </TrackedButtonLink>
    </aside>
  );
}
