import { Panel } from "@/app/_components/ui/Panel";
import { creditCosts } from "@/lib/clipstitchr/pricing/creditCosts";

export function PricingCreditRulesSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-accent-dark">
              How credits work
            </p>
            <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
              Credits are for generated extras, not ads from your saved clips.
            </h2>
            <p className="mt-4 leading-7 text-text-secondary">
              Making ads from clips you already uploaded is included. Credits
              are used when ClipStitchr creates new media or draft content for
              you.
            </p>
          </div>
          <Panel className="overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-sm font-bold text-text-primary">
              <span>Action</span>
              <span>Credits</span>
            </div>
            {creditCosts.map((cost) => (
              <div
                key={cost.action}
                className="grid grid-cols-[1fr_auto] gap-4 border-b border-border px-5 py-4 text-sm last:border-b-0"
              >
                <span className="text-text-secondary">{cost.action}</span>
                <span className="font-bold text-text-primary">
                  {cost.credits}
                </span>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </section>
  );
}
