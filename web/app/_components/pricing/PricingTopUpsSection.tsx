import { topUpPacks } from "@/lib/clipstitchr/pricing/topUpPacks";

export function PricingTopUpsSection() {
  return (
    <section className="pricing-topups">
      <div className="pricing-section-inner">
        <div className="pricing-topups-heading">
          <p className="marketing-eyebrow">Need more credits?</p>
          <h2 className="marketing-heading">
            One simple refill when you need more material.
          </h2>
          <p>
            Add 2,000 creation credits for $29. Monthly credits are used first,
            and refill credits roll over for 12 months while your subscription
            stays active. Refills do not add Clipr or Swapr videos.
          </p>
        </div>
        <div className="pricing-topup-list">
          {topUpPacks.map((pack, index) => (
            <article key={pack.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{pack.name}</h3>
              <strong>{pack.price}</strong>
              <p>{pack.credits}</p>
              <small>Enough for about {pack.usageExample}.</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
