import { PricingPlanCard } from "@/app/_components/pricing/PricingPlanCard";
import { pricingPlans } from "@/lib/clipstitchr/pricing/pricingPlans";

export function PricingPlansSection() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent-dark">
            Pick a plan
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            All plans include every ClipStitchr tool.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            Choose based on how many products, credits, daily drafts, and saved
            media you need. Pro is the main plan for builders who need regular
            ads without regular editing days.
          </p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <PricingPlanCard key={plan.key} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
