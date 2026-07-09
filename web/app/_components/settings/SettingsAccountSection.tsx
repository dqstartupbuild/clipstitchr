import { SettingsClipstitchrCliPanel } from "@/app/_components/settings/SettingsClipstitchrCliPanel";
import { SettingsPostBridgePanel } from "@/app/_components/settings/SettingsPostBridgePanel";
import { SettingsSubscriptionPanel } from "@/app/_components/settings/SettingsSubscriptionPanel";
import { SettingsSupportPanel } from "@/app/_components/settings/SettingsSupportPanel";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type SettingsAccountSectionProps = {
  isProductActionDisabled: boolean;
  products: ProductProfile[];
};

export function SettingsAccountSection({
  isProductActionDisabled,
  products,
}: SettingsAccountSectionProps) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby="account-settings">
      <div>
        <p className="text-sm font-semibold text-accent-dark">
          Account settings
        </p>
        <h2
          id="account-settings"
          className="mt-1 text-xl font-bold text-text-primary"
        >
          Your account
        </h2>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          These stay the same no matter which product is active.
        </p>
      </div>
      <SettingsClipstitchrCliPanel />
      <SettingsPostBridgePanel
        isProductActionDisabled={isProductActionDisabled}
        products={products}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <SettingsSupportPanel />
        <SettingsSubscriptionPanel />
      </div>
    </section>
  );
}
