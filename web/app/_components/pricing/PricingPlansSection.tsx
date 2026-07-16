import { BillingRenewalDisclosure } from "@/app/_components/billing/BillingRenewalDisclosure";
import { PricingPlanCard } from "@/app/_components/pricing/PricingPlanCard";
import { pricingPlans } from "@/lib/clipstitchr/pricing/pricingPlans";

export function PricingPlansSection() {
  return (
    <section id="plans" className="pricing-plans scroll-mt-20">
      <div className="pricing-section-inner">
        <div className="pricing-plans-intro">
          <h2 className="marketing-heading">Compare the plans.</h2>
          <p>
            Choose based on how often you create, how many products you manage,
            and how much of the work you want ClipStitchr to prepare for you.
          </p>
        </div>
        <div className="pricing-ledger">
          <div className="pricing-ledger-head" aria-hidden="true">
            <span>Plan</span>
            <span>Monthly</span>
            <span>Output</span>
            <span>What changes</span>
            <span>Choose</span>
          </div>
          {pricingPlans.map((plan, index) => (
            <PricingPlanCard key={plan.key} plan={plan} index={index} />
          ))}
        </div>
        <BillingRenewalDisclosure className="pricing-renewal-disclosure" />
      </div>
    </section>
  );
}
