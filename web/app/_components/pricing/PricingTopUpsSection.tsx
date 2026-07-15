import { topUpPacks } from "@/lib/clipstitchr/pricing/topUpPacks";

export function PricingTopUpsSection() {
  return (
    <section className="pricing-topups">
      <div className="pricing-section-inner">
        <div className="pricing-topups-heading">
          <p className="marketing-eyebrow">Need more credits?</p>
          <h2 className="marketing-heading">
            Top up when the library is thin and you need more material.
          </h2>
          <p>
            Top-ups are available to active subscribers. Monthly credits are
            used first, then top-up credits. Top-up credits roll over for 12
            months while the subscription stays active.
          </p>
        </div>
        <div className="pricing-topup-list">
          {topUpPacks.map((pack, index) => (
            <article key={pack.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{pack.name}</h3>
              <strong>{pack.price}</strong>
              <p>{pack.credits}</p>
              <small>
                Roughly {pack.videoEquivalent} if used for generated videos.
              </small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
