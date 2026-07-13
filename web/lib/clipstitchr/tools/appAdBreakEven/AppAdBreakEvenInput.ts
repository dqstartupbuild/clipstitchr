import type { AppAdBreakEvenRevenueWindow } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenRevenueWindow";

export type AppAdBreakEvenInput = {
  contributionMarginPercentage: number;
  creativeProductionCost: number;
  installToPaidPercentage: number;
  mediaSpend: number;
  revenuePerPayingCustomer: number;
  revenueWindow: AppAdBreakEvenRevenueWindow;
};
