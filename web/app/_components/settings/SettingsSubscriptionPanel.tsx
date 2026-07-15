import { CreditCard } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

export function SettingsSubscriptionPanel() {
  return (
    <Panel className="p-5">
      <div className="flex items-start gap-3">
        <span className="settings-panel-icon inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <CreditCard aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">
            Subscription
          </p>
          <h2 className="mt-1 text-lg font-bold text-text-primary">
            Plan management
          </h2>
          <button
            type="button"
            disabled
            className="mt-4 inline-flex h-10 cursor-not-allowed items-center justify-center rounded-lg border border-border bg-surface-elevated px-4 text-sm font-semibold text-text-tertiary"
          >
            Coming soon
          </button>
        </div>
      </div>
    </Panel>
  );
}
