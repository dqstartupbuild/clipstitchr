import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";
import type { PricingPlan } from "@/lib/clipstitchr/pricing/PricingPlan";

type PricingPlanCardProps = {
  index: number;
  plan: PricingPlan;
};

export function PricingPlanCard({ index, plan }: PricingPlanCardProps) {
  return (
    <article
      className={`pricing-ledger-row${plan.isFeatured ? " pricing-ledger-row-featured" : ""}`}
    >
      <header className="pricing-ledger-name">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <div>
          <h3>{plan.name}</h3>
          <p>{plan.bestFor}</p>
        </div>
      </header>

      <div className="pricing-ledger-price">
        <strong>{plan.price}</strong>
        <span>/ month</span>
      </div>

      <div className="pricing-ledger-capacity">
        <p>{plan.products}</p>
        <p>{plan.credits}</p>
        <p>{plan.storage}</p>
      </div>

      <ul className="pricing-ledger-features">
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      <PrimaryButtonLink href={plan.ctaHref} className="pricing-ledger-action">
        {plan.ctaLabel}
      </PrimaryButtonLink>
    </article>
  );
}
