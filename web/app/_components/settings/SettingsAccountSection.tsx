import { SettingsSocialPublishingPanel } from "@/app/_components/settings/SettingsSocialPublishingPanel";
import { SettingsSubscriptionPanel } from "@/app/_components/settings/SettingsSubscriptionPanel";
import { SettingsStudioBetaPanel } from "@/app/_components/settings/SettingsStudioBetaPanel";
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
        <h2
          id="account-settings"
          className="text-xl font-bold text-text-primary"
        >
          Account settings
        </h2>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          These stay the same no matter which product is active.
        </p>
      </div>
      <SettingsSocialPublishingPanel
        isProductActionDisabled={isProductActionDisabled}
        products={products}
      />
      <SettingsStudioBetaPanel />
      <SettingsSubscriptionPanel />
      <SettingsSupportPanel />
    </section>
  );
}
