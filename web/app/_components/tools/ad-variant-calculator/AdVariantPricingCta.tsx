import { ArrowRight } from "lucide-react";
import { TrackedButtonLink } from "@/app/_components/analytics/TrackedButtonLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";

export function AdVariantPricingCta() {
  return (
    <aside className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="text-base font-bold text-text-primary">
        Ready to turn the first batch into finished ads?
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        ClipStitchr can pair one selected demo with up to 20 UGC clips in a
        batch, creating one finished Stitch for each UGC clip.
      </p>
      <TrackedButtonLink
        href="/pricing"
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="Ad variant calculator"
        contentId="ad_variant_calculator_pricing"
        contentName="See ClipStitchr plans"
      >
        See ClipStitchr plans
        <ArrowRight aria-hidden className="h-4 w-4" />
      </TrackedButtonLink>
    </aside>
  );
}
