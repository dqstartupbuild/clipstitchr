import { pricingOfferItems } from "@/lib/clipstitchr/pricing/pricingOfferItems";

export function PricingOfferStackSection() {
  return (
    <section className="pricing-included">
      <div className="pricing-section-inner">
        <div className="pricing-included-heading">
          <p>Every plan starts with the whole production system.</p>
          <h2 className="marketing-heading">The whole system, included.</h2>
        </div>
        <div className="pricing-included-list">
          {pricingOfferItems.map((item, index) => (
            <p key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
