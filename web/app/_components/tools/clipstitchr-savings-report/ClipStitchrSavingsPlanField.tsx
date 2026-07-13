import { pricingPlans } from "@/lib/clipstitchr/pricing/pricingPlans";
import type { ClipStitchrSavingsInput } from "@/lib/clipstitchr/tools/clipStitchrSavings/ClipStitchrSavingsInput";

type ClipStitchrSavingsPlanFieldProps = {
  onChange: (
    value: Pick<
      ClipStitchrSavingsInput,
      "clipstitchrMonthlyPrice" | "clipstitchrPlanName"
    >,
  ) => void;
  value: ClipStitchrSavingsInput;
};

export function ClipStitchrSavingsPlanField({
  onChange,
  value,
}: ClipStitchrSavingsPlanFieldProps) {
  const pricedPlans = pricingPlans.filter(
    (plan) => plan.monthlyPriceUsd !== null,
  );

  return (
    <label className="grid gap-2 text-sm font-semibold text-text-primary">
      ClipStitchr plan in the modeled scenario
      <select
        className="h-11 rounded-lg border border-border bg-surface px-3 text-sm font-bold text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
        value={value.clipstitchrPlanName}
        onChange={(event) => {
          const plan = pricedPlans.find(
            (candidate) => candidate.name === event.currentTarget.value,
          );

          if (
            plan?.monthlyPriceUsd !== null &&
            plan?.monthlyPriceUsd !== undefined
          ) {
            onChange({
              clipstitchrMonthlyPrice: plan.monthlyPriceUsd,
              clipstitchrPlanName: plan.name,
            });
          }
        }}
      >
        {pricedPlans.map((plan) => (
          <option key={plan.key} value={plan.name}>
            {plan.name} — {plan.price}/month
          </option>
        ))}
      </select>
      <span className="text-xs font-normal leading-5 text-text-tertiary">
        Exact public monthly prices come from the same data as the pricing page.
        Custom Agency pricing is not modeled.
      </span>
    </label>
  );
}
