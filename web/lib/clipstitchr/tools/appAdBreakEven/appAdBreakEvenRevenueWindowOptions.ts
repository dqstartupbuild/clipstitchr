import type { AppAdBreakEvenRevenueWindow } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenRevenueWindow";

export const appAdBreakEvenRevenueWindowOptions: Array<{
  label: string;
  value: AppAdBreakEvenRevenueWindow;
}> = [
  { label: "30 days", value: "30-days" },
  { label: "90 days", value: "90-days" },
  { label: "12 months", value: "12-months" },
  { label: "Lifetime", value: "lifetime" },
];
