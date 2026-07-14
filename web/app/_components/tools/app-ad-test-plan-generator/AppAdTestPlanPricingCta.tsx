import { ArrowRight } from "lucide-react";
import { PublicToolPaidCtaLink } from "@/app/_components/tools/gates/PublicToolPaidCtaLink";
import { PRIMARY_BUTTON_CLASS_NAME } from "@/app/_components/ui/primaryButtonClassName";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

export function AppAdTestPlanPricingCta({
  variant,
}: {
  variant: PublicToolGateVariant;
}) {
  return (
    <aside className="mt-6 rounded-lg border border-accent/30 bg-accent/10 p-5">
      <h3 className="text-base font-bold text-text-primary">
        Ready to produce the plan without rebuilding every version?
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        ClipStitchr turns saved Hook/UGC clips and product demos into focused
        production batches for paid accounts.
      </p>
      <PublicToolPaidCtaLink
        className={`${PRIMARY_BUTTON_CLASS_NAME} mt-4`}
        contentCategory="App ad test plan generator"
        contentId="app_ad_test_plan_generator_pricing"
        contentName="See ClipStitchr plans"
        toolKey="app-ad-test-plan-generator"
        variant={variant}
      >
        See ClipStitchr plans
        <ArrowRight aria-hidden className="h-4 w-4" />
      </PublicToolPaidCtaLink>
    </aside>
  );
}
