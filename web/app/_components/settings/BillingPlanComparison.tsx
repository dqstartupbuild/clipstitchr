import { BillingPlanDesktopComparison } from "@/app/_components/settings/BillingPlanDesktopComparison";
import { BillingPlanMobileComparison } from "@/app/_components/settings/BillingPlanMobileComparison";
import type { BillingPlanComparisonProps } from "@/app/_components/settings/BillingPlanComparisonProps";

export function BillingPlanComparison(props: BillingPlanComparisonProps) {
  return (
    <>
      <BillingPlanMobileComparison {...props} />
      <BillingPlanDesktopComparison {...props} />
    </>
  );
}
