import type { AppAdBreakEvenRevenueWindow } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenRevenueWindow";
import type { AppAdBreakEvenTargetStatus } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenTargetStatus";

export type AppAdBreakEvenResult = {
  breakEvenCustomerStatus: AppAdBreakEvenTargetStatus;
  breakEvenCustomers: number | null;
  breakEvenInstallStatus: AppAdBreakEvenTargetStatus;
  breakEvenInstalls: number | null;
  breakEvenMediaRoas: number | null;
  contributionMarginPercentage: number;
  contributionPerCustomer: number;
  creativeCostSharePercentage: number | null;
  creativeProductionCost: number;
  installToPaidPercentage: number;
  maximumBlendedCac: number;
  maximumBlendedCpi: number | null;
  mediaCostSharePercentage: number | null;
  mediaSpend: number;
  minimumRevenueNeeded: number | null;
  revenueAtWholeCustomerThreshold: number | null;
  revenuePerPayingCustomer: number;
  revenueWindow: AppAdBreakEvenRevenueWindow;
  totalAcquisitionInvestment: number;
};
