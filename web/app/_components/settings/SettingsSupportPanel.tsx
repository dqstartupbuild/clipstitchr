import { LifeBuoy } from "lucide-react";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import { Panel } from "@/app/_components/ui/Panel";

export function SettingsSupportPanel() {
  return (
    <Panel className="p-5">
      <div className="flex items-start gap-3">
        <span className="settings-panel-icon inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <LifeBuoy aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Support</p>
          <h2 className="mt-1 text-lg font-bold text-text-primary">
            Get help
          </h2>
          <SecondaryButtonLink
            href="mailto:support@clipstitchr.com"
            className="mt-4"
          >
            Contact support
          </SecondaryButtonLink>
        </div>
      </div>
    </Panel>
  );
}
