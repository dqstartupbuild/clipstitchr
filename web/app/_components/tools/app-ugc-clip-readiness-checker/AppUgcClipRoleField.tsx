import type { AppUgcClipRole } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipRole";
import { appUgcClipRoleOptions } from "@/lib/clipstitchr/tools/appUgcClipReadiness/appUgcClipRoleOptions";

type AppUgcClipRoleFieldProps = {
  onChange: (role: AppUgcClipRole) => void;
  value: AppUgcClipRole;
};

export function AppUgcClipRoleField({
  onChange,
  value,
}: AppUgcClipRoleFieldProps) {
  return (
    <label
      className="grid gap-2 text-sm font-bold text-text-primary"
      htmlFor="app-ugc-clip-role"
    >
      What job should this raw clip do?
      <select
        id="app-ugc-clip-role"
        className="h-11 rounded-lg border border-border bg-surface px-3 text-sm font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
        value={value}
        onChange={(event) =>
          onChange(event.currentTarget.value as AppUgcClipRole)
        }
      >
        {appUgcClipRoleOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} — {option.description}
          </option>
        ))}
      </select>
      <span className="text-xs font-normal leading-5 text-text-tertiary">
        The role changes the honest audio and planning-length checks.
      </span>
    </label>
  );
}
