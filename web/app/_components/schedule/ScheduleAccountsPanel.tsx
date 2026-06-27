import { ProductPostBridgeAccountsPanel } from "@/app/_components/settings/ProductPostBridgeAccountsPanel";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ScheduleAccountsPanelProps = {
  isDisabled: boolean;
  product?: ProductProfile;
};

export function ScheduleAccountsPanel({
  isDisabled,
  product,
}: ScheduleAccountsPanelProps) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby="schedule-accounts">
      <div>
        <p className="text-sm font-semibold text-accent-dark">
          Config/accounts
        </p>
        <h2
          id="schedule-accounts"
          className="mt-1 text-xl font-bold text-text-primary"
        >
          Product posting accounts
        </h2>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          Pick the accounts this product should use by default when you post.
        </p>
      </div>
      <ProductPostBridgeAccountsPanel isDisabled={isDisabled} product={product} />
    </section>
  );
}
