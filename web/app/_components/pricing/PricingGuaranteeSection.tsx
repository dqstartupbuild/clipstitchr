import { guaranteeRewards } from "@/lib/clipstitchr/pricing/guaranteeRewards";

export function PricingGuaranteeSection() {
  return (
    <section className="pricing-challenge">
      <div className="pricing-section-inner">
        <div className="pricing-two-part">
          <div>
            <p className="marketing-eyebrow">10k Organic Views Challenge</p>
            <h2 className="marketing-heading">30 posts. 30 days. 10k views.</h2>
          </div>
          <div className="pricing-challenge-copy">
            <p>
              Publish 30 ClipStitchr-made posts in 30 days. If they do not reach
              10k total organic views, your next month is on us, with extra
              credits to keep testing.
            </p>
            <p>
              Hook Lab is part of setup. Add lines from posts in your niche that
              made you stop scrolling, plus your own winners, so ClipStitchr has
              a real taste file before you start posting.
            </p>
            <small>
              Views count across public TikTok, Reels, and Shorts posts. No paid
              boosting. Submit links or analytics screenshots within 7 days
              after the challenge window.
            </small>
          </div>
        </div>
        <div className="pricing-challenge-rewards">
          {guaranteeRewards.map((reward) => (
            <div key={reward.plan}>
              <strong>{reward.plan}</strong>
              <p>{reward.reward}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
