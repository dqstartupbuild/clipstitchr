import { Panel } from "@/app/_components/ui/Panel";
import { guaranteeRewards } from "@/lib/clipstitchr/pricing/guaranteeRewards";

export function PricingGuaranteeSection() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-accent-dark">
              10k Organic Views Challenge
            </p>
            <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
              Publish 30 ClipStitchr-made posts in 30 days.
            </h2>
            <p className="mt-4 leading-7 text-text-secondary">
              If they do not reach 10k total organic views, your next month is
              on us, with extra credits to keep testing.
            </p>
            <p className="mt-4 text-sm leading-6 text-text-tertiary">
              Views count across public TikTok, Reels, and Shorts posts. No paid
              boosting. Submit links or analytics screenshots within 7 days
              after the challenge window.
            </p>
          </div>
          <Panel className="overflow-hidden">
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
