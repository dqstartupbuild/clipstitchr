import type { AppAdBreakEvenRevenueWindow } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenRevenueWindow";
import { appAdBreakEvenRevenueWindowOptions } from "@/lib/clipstitchr/tools/appAdBreakEven/appAdBreakEvenRevenueWindowOptions";

export function normalizeAppAdBreakEvenRevenueWindow(
  value: AppAdBreakEvenRevenueWindow,
): AppAdBreakEvenRevenueWindow {
  return appAdBreakEvenRevenueWindowOptions.some(
    (option) => option.value === value,
  )
    ? value
    : "90-days";
}
