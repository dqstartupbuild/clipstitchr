import { SettingsSubscriptionPanel } from "@/app/_components/settings/SettingsSubscriptionPanel";
import { SettingsSupportPanel } from "@/app/_components/settings/SettingsSupportPanel";

export function SettingsAccountSection() {
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
      <SettingsSubscriptionPanel />
      <SettingsSupportPanel />
    </section>
  );
}
