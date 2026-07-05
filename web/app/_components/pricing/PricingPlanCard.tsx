import { Check } from "lucide-react";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";
import { Panel } from "@/app/_components/ui/Panel";
import type { PricingPlan } from "@/lib/clipstitchr/pricing/PricingPlan";

type PricingPlanCardProps = {
  plan: PricingPlan;
};

export function PricingPlanCard({ plan }: PricingPlanCardProps) {
  return (
    <Panel
      className={[
        "relative flex h-full flex-col rounded-2xl p-6",
        plan.isFeatured
          ? "border-accent/50 bg-accent/5 shadow-[0_0_60px_rgba(139,92,246,0.16)]"
          : "",
      ].join(" ")}
    >
      {plan.isFeatured ? (
        <p className="absolute right-4 top-4 rounded-md bg-accent px-2.5 py-1 text-xs font-bold text-white">
          Most popular
        </p>
      ) : null}
      <div>
        <h2 className="marketing-subheading text-3xl text-text-primary">
          {plan.name}
        </h2>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {plan.bestFor}
        </p>
        <div className="mt-6 flex items-end gap-1">
          <span className="marketing-heading text-5xl text-text-primary">
            {plan.price}
          </span>
          <span className="pb-1 text-sm font-semibold text-text-tertiary">
            /mo
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-2 border-y border-border py-5 text-sm font-semibold text-text-primary">
        <p>{plan.products}</p>
        <p>{plan.credits}</p>
        <p>{plan.storage}</p>
      </div>

      <ul className="mt-6 flex-1 space-y-3 text-sm leading-6 text-text-secondary">
        {plan.features.map((feature) => (
          <li className="flex gap-3" key={feature}>
            <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-accent" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <PrimaryButtonLink href={plan.ctaHref} className="mt-8 w-full">
        {plan.ctaLabel}
      </PrimaryButtonLink>
    </Panel>
  );
}
