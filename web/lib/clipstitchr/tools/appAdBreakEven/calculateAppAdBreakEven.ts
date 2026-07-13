import type { AppAdBreakEvenInput } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenInput";
import type { AppAdBreakEvenResult } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenResult";
import type { AppAdBreakEvenTargetStatus } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenTargetStatus";
import { normalizeAppAdBreakEvenInput } from "@/lib/clipstitchr/tools/appAdBreakEven/normalizeAppAdBreakEvenInput";
import { getSafeWholeTarget } from "@/lib/clipstitchr/tools/numbers/getSafeWholeTarget";

export function calculateAppAdBreakEven(
  input: AppAdBreakEvenInput,
): AppAdBreakEvenResult {
  const normalizedInput = normalizeAppAdBreakEvenInput(input);
  const marginRate = normalizedInput.contributionMarginPercentage / 100;
  const paidRate = normalizedInput.installToPaidPercentage / 100;
  const contributionPerCustomer =
    normalizedInput.revenuePerPayingCustomer * marginRate;
  const totalAcquisitionInvestment =
    normalizedInput.mediaSpend + normalizedInput.creativeProductionCost;
  const minimumRevenueNeeded =
    totalAcquisitionInvestment === 0
      ? 0
      : marginRate > 0
        ? totalAcquisitionInvestment / marginRate
        : null;
  let breakEvenCustomers: number | null = null;
  let breakEvenCustomerStatus: AppAdBreakEvenTargetStatus =
    "missing-customer-value";

  if (totalAcquisitionInvestment === 0) {
    breakEvenCustomers = 0;
    breakEvenCustomerStatus = "ready";
  } else if (contributionPerCustomer > 0) {
    breakEvenCustomers = getSafeWholeTarget(
      totalAcquisitionInvestment / contributionPerCustomer,
    );
    breakEvenCustomerStatus =
      breakEvenCustomers === null ? "outside-range" : "ready";
  }

  let breakEvenInstalls: number | null = null;
  let breakEvenInstallStatus: AppAdBreakEvenTargetStatus =
    breakEvenCustomerStatus;

  if (breakEvenCustomers === 0) {
    breakEvenInstalls = 0;
    breakEvenInstallStatus = "ready";
  } else if (breakEvenCustomers !== null && paidRate > 0) {
    breakEvenInstalls = getSafeWholeTarget(breakEvenCustomers / paidRate);
    breakEvenInstallStatus =
      breakEvenInstalls === null ? "outside-range" : "ready";
  } else if (breakEvenCustomers !== null) {
    breakEvenInstallStatus = "missing-conversion-rate";
  }

  const creativeCostSharePercentage =
    totalAcquisitionInvestment > 0
      ? (normalizedInput.creativeProductionCost / totalAcquisitionInvestment) *
        100
      : null;

  return {
    breakEvenCustomerStatus,
    breakEvenCustomers,
    breakEvenInstallStatus,
    breakEvenInstalls,
    breakEvenMediaRoas:
      normalizedInput.mediaSpend > 0 && minimumRevenueNeeded !== null
        ? minimumRevenueNeeded / normalizedInput.mediaSpend
        : null,
    contributionMarginPercentage: normalizedInput.contributionMarginPercentage,
    contributionPerCustomer,
    creativeCostSharePercentage,
    creativeProductionCost: normalizedInput.creativeProductionCost,
    installToPaidPercentage: normalizedInput.installToPaidPercentage,
    maximumBlendedCac: contributionPerCustomer,
    maximumBlendedCpi: paidRate > 0 ? contributionPerCustomer * paidRate : null,
    mediaCostSharePercentage:
      creativeCostSharePercentage === null
        ? null
        : 100 - creativeCostSharePercentage,
    mediaSpend: normalizedInput.mediaSpend,
    minimumRevenueNeeded,
    revenueAtWholeCustomerThreshold:
      breakEvenCustomers === null
        ? null
        : breakEvenCustomers * normalizedInput.revenuePerPayingCustomer,
    revenuePerPayingCustomer: normalizedInput.revenuePerPayingCustomer,
    revenueWindow: normalizedInput.revenueWindow,
    totalAcquisitionInvestment,
  };
}
