import { creditCosts } from "@/lib/clipstitchr/pricing/creditCosts";

export function PricingCreditRulesSection() {
  return (
    <section className="pricing-credits">
      <div className="pricing-section-inner pricing-two-part">
        <div>
          <p className="marketing-eyebrow">How credits work</p>
          <h2 className="marketing-heading">
            Credits are for generated extras, not ads from your saved clips.
          </h2>
          <p className="pricing-body-copy">
            Making ads from clips you already uploaded is included. Credits are
            used when ClipStitchr creates new media or draft content for you.
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
