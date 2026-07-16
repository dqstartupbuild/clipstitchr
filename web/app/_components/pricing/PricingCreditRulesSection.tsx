import { creditCosts } from "@/lib/clipstitchr/pricing/creditCosts";

export function PricingCreditRulesSection() {
  return (
    <section className="pricing-credits">
      <div className="pricing-section-inner pricing-two-part">
        <div>
          <p className="marketing-eyebrow">How credits work</p>
          <h2 className="marketing-heading">
            Creation credits and AI videos have separate limits.
          </h2>
          <p className="pricing-body-copy">
            Creation credits cover finished stitches, Swipr results, and
            standalone photos. Clipr and Swapr videos use the separate monthly
            video allowance shown on your plan.
          </p>
        </div>
        <div className="pricing-rate-table">
          <div className="pricing-rate-table-head">
            <span>Action</span>
            <span>Credits</span>
          </div>
          {creditCosts.map((cost) => (
            <div key={cost.action} className="pricing-rate-table-row">
              <span>{cost.action}</span>
              <strong>{cost.credits}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
