import { appAdBreakEvenRevenueWindowOptions } from "@/lib/clipstitchr/tools/appAdBreakEven/appAdBreakEvenRevenueWindowOptions";
import type { AppAdBreakEvenRevenueWindow } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenRevenueWindow";

export function getAppAdBreakEvenRevenueWindowLabel(
  value: AppAdBreakEvenRevenueWindow,
) {
  return (
    appAdBreakEvenRevenueWindowOptions.find((option) => option.value === value)
      ?.label ?? "90 days"
  );
}
