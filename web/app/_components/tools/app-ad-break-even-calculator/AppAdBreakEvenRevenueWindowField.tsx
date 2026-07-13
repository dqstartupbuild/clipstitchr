import type { AppAdBreakEvenRevenueWindow } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenRevenueWindow";
import { appAdBreakEvenRevenueWindowOptions } from "@/lib/clipstitchr/tools/appAdBreakEven/appAdBreakEvenRevenueWindowOptions";

type AppAdBreakEvenRevenueWindowFieldProps = {
  value: AppAdBreakEvenRevenueWindow;
  onChange: (value: AppAdBreakEvenRevenueWindow) => void;
};

export function AppAdBreakEvenRevenueWindowField({
  value,
  onChange,
}: AppAdBreakEvenRevenueWindowFieldProps) {
  const descriptionId = "app-ad-break-even-window-description";

  return (
    <label className="block" htmlFor="app-ad-break-even-window">
      <span className="text-sm font-semibold text-text-primary">
        Revenue window
      </span>
      <select
        id="app-ad-break-even-window"
        aria-describedby={descriptionId}
        value={value}
        className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm font-bold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
        onChange={(event) =>
          onChange(event.target.value as AppAdBreakEvenRevenueWindow)
        }
      >
        {appAdBreakEvenRevenueWindowOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span
        className="mt-2 block text-xs leading-5 text-text-tertiary"
        id={descriptionId}
      >
        Match this window to the customer revenue entered above.
      </span>
    </label>
  );
}
