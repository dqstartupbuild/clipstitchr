import { Panel } from "@/app/_components/ui/Panel";
import { topUpPacks } from "@/lib/clipstitchr/pricing/topUpPacks";

export function PricingTopUpsSection() {
  return (
    <section className="bg-surface-muted/45 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="marketing-eyebrow">
            Need more credits?
          </p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            Top up when the library is thin and you need more material.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            Top-ups are available to active subscribers. Monthly credits are used
            first, then top-up credits. Top-up credits roll over for 12 months
            while the subscription stays active.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {topUpPacks.map((pack) => (
            <Panel className="rounded-2xl p-6" key={pack.name}>
              <h3 className="marketing-subheading text-2xl text-text-primary">
                {pack.name}
              </h3>
              <p className="marketing-heading mt-4 text-5xl text-text-primary">
                {pack.price}
              </p>
              <p className="mt-4 text-sm font-semibold text-text-primary">
                {pack.credits}
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Roughly {pack.videoEquivalent} if used for generated videos.
              </p>
            </Panel>
          ))}
        </div>
      </div>
    </section>
  );
}
