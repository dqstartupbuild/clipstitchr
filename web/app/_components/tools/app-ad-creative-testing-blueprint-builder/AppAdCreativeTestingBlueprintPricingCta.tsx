import { ArrowRight } from "lucide-react";
import { PublicToolPaidCtaLink } from "@/app/_components/tools/gates/PublicToolPaidCtaLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

export function AppAdCreativeTestingBlueprintPricingCta({
  variant,
}: {
  variant: PublicToolGateVariant;
}) {
  return (
    <aside className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="text-base font-bold text-text-primary">
        Ready to produce the blueprint without rebuilding every ad?
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        ClipStitchr keeps Hook/UGC openings and product demos reusable, then
        turns focused combinations into finished ads inside its paid workflow.
      </p>
      <PublicToolPaidCtaLink
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="App ad creative testing blueprint builder"
        contentId="app_ad_creative_testing_blueprint_builder_pricing"
        contentName="See ClipStitchr plans"
        toolKey="app-ad-creative-testing-blueprint-builder"
        variant={variant}
      >
        See ClipStitchr plans
        <ArrowRight aria-hidden className="h-4 w-4" />
      </PublicToolPaidCtaLink>
    </aside>
  );
}
