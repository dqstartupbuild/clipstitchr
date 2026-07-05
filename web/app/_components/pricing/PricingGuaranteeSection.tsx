import { Panel } from "@/app/_components/ui/Panel";
import { guaranteeRewards } from "@/lib/clipstitchr/pricing/guaranteeRewards";

export function PricingGuaranteeSection() {
  return (
    <section className="bg-background px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="marketing-eyebrow">
              10k Organic Views Challenge
            </p>
            <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
              Publish 30 ClipStitchr-made posts in 30 days.
            </h2>
            <p className="mt-5 leading-7 text-text-secondary">
              If they do not reach 10k total organic views, your next month is
              on us, with extra credits to keep testing.
            </p>
            <p className="mt-4 leading-7 text-text-secondary">
              Hook Lab is part of setup. Add lines from posts in your niche
              that made you stop scrolling, plus your own winners, so
              ClipStitchr has a real taste file before you start posting.
            </p>
            <p className="mt-4 text-sm leading-6 text-text-tertiary">
              Views count across public TikTok, Reels, and Shorts posts. No paid
              boosting. Submit links or analytics screenshots within 7 days
              after the challenge window.
            </p>
          </div>
          <Panel className="overflow-hidden rounded-2xl">
            {guaranteeRewards.map((reward) => (
              <div
                className="grid gap-2 border-b border-border px-5 py-4 last:border-b-0 sm:grid-cols-[8rem_1fr]"
                key={reward.plan}
              >
                <p className="font-bold text-text-primary">{reward.plan}</p>
                <p className="text-sm leading-6 text-text-secondary">
                  {reward.reward}
                </p>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </section>
  );
}
