import { Monitor } from "lucide-react";
import { ThemeModeSelect } from "@/app/_components/settings/ThemeModeSelect";
import { Panel } from "@/app/_components/ui/Panel";

export function SettingsAppearancePanel() {
  return (
    <Panel className="p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <Monitor aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-accent-dark">
            Appearance
          </p>
          <h2 className="mt-1 text-lg font-bold text-text-primary">Theme</h2>
          <div className="mt-4 max-w-xs">
            <ThemeModeSelect />
          </div>
        </div>
      </div>
    </Panel>
  );
}
