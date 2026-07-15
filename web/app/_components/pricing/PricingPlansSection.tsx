import { PricingPlanCard } from "@/app/_components/pricing/PricingPlanCard";
import { pricingPlans } from "@/lib/clipstitchr/pricing/pricingPlans";

export function PricingPlansSection() {
  return (
    <section id="plans" className="pricing-plans scroll-mt-20">
      <div className="pricing-section-inner">
        <div className="pricing-plans-intro">
          <h2 className="marketing-heading">Compare the plans.</h2>
          <p>
            Choose based on how many products, credits, daily drafts, and saved
            media you need. Pro is the main plan for builders who need regular
            ads without regular editing days.
          </p>
        </div>
        <div className="pricing-ledger">
          <div className="pricing-ledger-head" aria-hidden="true">
            <span>Plan</span>
            <span>Monthly</span>
            <span>Capacity</span>
            <span>What changes</span>
            <span>Choose</span>
          </div>
          {pricingPlans.map((plan, index) => (
            <PricingPlanCard key={plan.key} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
